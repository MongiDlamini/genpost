import { TWITTER_CONFIG, TWITTER_USER_FIELDS, TWITTER_TWEET_FIELDS, TWITTER_MEDIA_FIELDS } from "./config"

export interface TwitterUser {
  id: string
  name: string
  username: string
  description?: string
  profile_image_url?: string
  public_metrics?: {
    followers_count: number
    following_count: number
    tweet_count: number
    listed_count: number
  }
  verified?: boolean
  created_at?: string
  location?: string
  url?: string
}

export interface TwitterTweet {
  id: string
  text: string
  created_at: string
  author_id: string
  public_metrics?: {
    retweet_count: number
    like_count: number
    reply_count: number
    quote_count: number
    bookmark_count: number
    impression_count: number
  }
  context_annotations?: Array<{
    domain: { id: string; name: string; description: string }
    entity: { id: string; name: string; description?: string }
  }>
  entities?: {
    urls?: Array<{ start: number; end: number; url: string; expanded_url: string; display_url: string }>
    hashtags?: Array<{ start: number; end: number; tag: string }>
    mentions?: Array<{ start: number; end: number; username: string; id: string }>
  }
  attachments?: {
    media_keys?: string[]
  }
}

export interface TwitterMedia {
  media_key: string
  type: "photo" | "video" | "animated_gif"
  url?: string
  preview_image_url?: string
  duration_ms?: number
  height?: number
  width?: number
  alt_text?: string
  public_metrics?: {
    view_count?: number
  }
}

export interface TwitterUploadResponse {
  media_id: string
  media_id_string: string
  size: number
  expires_after_secs: number
  image?: {
    image_type: string
    w: number
    h: number
  }
  video?: {
    video_type: string
  }
}

export class TwitterAPI {
  private accessToken: string

  constructor(accessToken: string) {
    this.accessToken = accessToken
  }

  private async makeRequest(endpoint: string, options: RequestInit = {}) {
    const url = `${TWITTER_CONFIG.apiUrl}${endpoint}`
    const response = await fetch(url, {
      ...options,
      headers: {
        Authorization: `Bearer ${this.accessToken}`,
        "Content-Type": "application/json",
        ...options.headers,
      },
    })

    if (!response.ok) {
      const error = await response.text()
      throw new Error(`Twitter API error: ${response.status} ${error}`)
    }

    return await response.json()
  }

  private async makeUploadRequest(endpoint: string, options: RequestInit = {}) {
    const url = `https://upload.twitter.com/1.1${endpoint}`
    const response = await fetch(url, {
      ...options,
      headers: {
        Authorization: `Bearer ${this.accessToken}`,
        ...options.headers,
      },
    })

    if (!response.ok) {
      const error = await response.text()
      throw new Error(`Twitter Upload API error: ${response.status} ${error}`)
    }

    return await response.json()
  }

  async getUserProfile(userId?: string): Promise<TwitterUser> {
    const endpoint = userId ? `/users/${userId}` : "/users/me"
    const params = new URLSearchParams({
      "user.fields": TWITTER_USER_FIELDS.join(","),
    })

    const response = await this.makeRequest(`${endpoint}?${params.toString()}`)
    return response.data
  }

  async getUserByUsername(username: string): Promise<TwitterUser> {
    const params = new URLSearchParams({
      "user.fields": TWITTER_USER_FIELDS.join(","),
    })

    const response = await this.makeRequest(`/users/by/username/${username}?${params.toString()}`)
    return response.data
  }

  async getUserTweets(
    userId: string,
    options: {
      max_results?: number
      since_id?: string
      until_id?: string
      exclude?: string[]
    } = {},
  ): Promise<{ data: TwitterTweet[]; meta: any }> {
    const params = new URLSearchParams({
      "tweet.fields": TWITTER_TWEET_FIELDS.join(","),
      "media.fields": TWITTER_MEDIA_FIELDS.join(","),
      expansions: "attachments.media_keys,author_id",
      max_results: (options.max_results || 10).toString(),
    })

    if (options.since_id) params.append("since_id", options.since_id)
    if (options.until_id) params.append("until_id", options.until_id)
    if (options.exclude) params.append("exclude", options.exclude.join(","))

    const response = await this.makeRequest(`/users/${userId}/tweets?${params.toString()}`)
    return {
      data: response.data || [],
      meta: response.meta || {},
    }
  }

  async getMyTweets(
    options: {
      max_results?: number
      since_id?: string
      until_id?: string
    } = {},
  ): Promise<{ data: TwitterTweet[]; meta: any }> {
    const user = await this.getUserProfile()
    return this.getUserTweets(user.id, options)
  }

  async uploadMedia(mediaData: Buffer, mediaType: string, altText?: string): Promise<TwitterUploadResponse> {
    // Step 1: Initialize upload
    const initResponse = await this.makeUploadRequest("/media/upload.json", {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: new URLSearchParams({
        command: "INIT",
        total_bytes: mediaData.length.toString(),
        media_type: mediaType,
        media_category: mediaType.startsWith("image/") ? "tweet_image" : "tweet_video",
      }),
    })

    const mediaId = initResponse.media_id_string

    // Step 2: Upload media in chunks
    const chunkSize = 5 * 1024 * 1024 // 5MB chunks
    let segmentIndex = 0

    for (let i = 0; i < mediaData.length; i += chunkSize) {
      const chunk = mediaData.slice(i, i + chunkSize)
      const formData = new FormData()
      formData.append("command", "APPEND")
      formData.append("media_id", mediaId)
      formData.append("segment_index", segmentIndex.toString())
      formData.append("media", new Blob([chunk]))

      await this.makeUploadRequest("/media/upload.json", {
        method: "POST",
        body: formData,
      })

      segmentIndex++
    }

    // Step 3: Finalize upload
    const finalizeResponse = await this.makeUploadRequest("/media/upload.json", {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: new URLSearchParams({
        command: "FINALIZE",
        media_id: mediaId,
      }),
    })

    // Step 4: Add alt text if provided
    if (altText && mediaType.startsWith("image/")) {
      await this.makeUploadRequest("/media/metadata/create.json", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          media_id: mediaId,
          alt_text: { text: altText },
        }),
      })
    }

    return finalizeResponse
  }

  async createTweet(options: {
    text: string
    media_ids?: string[]
    reply?: { in_reply_to_tweet_id: string }
    quote_tweet_id?: string
    poll?: {
      options: string[]
      duration_minutes: number
    }
    geo?: {
      place_id: string
    }
    reply_settings?: "everyone" | "mentionedUsers" | "following"
  }): Promise<{ data: { id: string; text: string } }> {
    const payload: any = {
      text: options.text,
    }

    if (options.media_ids && options.media_ids.length > 0) {
      payload.media = { media_ids: options.media_ids }
    }

    if (options.reply) {
      payload.reply = options.reply
    }

    if (options.quote_tweet_id) {
      payload.quote_tweet_id = options.quote_tweet_id
    }

    if (options.poll) {
      payload.poll = options.poll
    }

    if (options.geo) {
      payload.geo = options.geo
    }

    if (options.reply_settings) {
      payload.reply_settings = options.reply_settings
    }

    return await this.makeRequest("/tweets", {
      method: "POST",
      body: JSON.stringify(payload),
    })
  }

  async deleteTweet(tweetId: string): Promise<{ data: { deleted: boolean } }> {
    return await this.makeRequest(`/tweets/${tweetId}`, {
      method: "DELETE",
    })
  }

  async getTweet(tweetId: string): Promise<TwitterTweet> {
    const params = new URLSearchParams({
      "tweet.fields": TWITTER_TWEET_FIELDS.join(","),
      "media.fields": TWITTER_MEDIA_FIELDS.join(","),
      "user.fields": TWITTER_USER_FIELDS.join(","),
      expansions: "attachments.media_keys,author_id",
    })

    const response = await this.makeRequest(`/tweets/${tweetId}?${params.toString()}`)
    return response.data
  }

  async likeTweet(tweetId: string): Promise<{ data: { liked: boolean } }> {
    const user = await this.getUserProfile()
    return await this.makeRequest(`/users/${user.id}/likes`, {
      method: "POST",
      body: JSON.stringify({ tweet_id: tweetId }),
    })
  }

  async unlikeTweet(tweetId: string): Promise<{ data: { liked: boolean } }> {
    const user = await this.getUserProfile()
    return await this.makeRequest(`/users/${user.id}/likes/${tweetId}`, {
      method: "DELETE",
    })
  }

  async retweetTweet(tweetId: string): Promise<{ data: { retweeted: boolean } }> {
    const user = await this.getUserProfile()
    return await this.makeRequest(`/users/${user.id}/retweets`, {
      method: "POST",
      body: JSON.stringify({ tweet_id: tweetId }),
    })
  }

  async unretweetTweet(tweetId: string): Promise<{ data: { retweeted: boolean } }> {
    const user = await this.getUserProfile()
    return await this.makeRequest(`/users/${user.id}/retweets/${tweetId}`, {
      method: "DELETE",
    })
  }

  async followUser(userId: string): Promise<{ data: { following: boolean; pending_follow: boolean } }> {
    const user = await this.getUserProfile()
    return await this.makeRequest(`/users/${user.id}/following`, {
      method: "POST",
      body: JSON.stringify({ target_user_id: userId }),
    })
  }

  async unfollowUser(userId: string): Promise<{ data: { following: boolean } }> {
    const user = await this.getUserProfile()
    return await this.makeRequest(`/users/${user.id}/following/${userId}`, {
      method: "DELETE",
    })
  }

  async getFollowing(
    userId?: string,
    options: {
      max_results?: number
      pagination_token?: string
    } = {},
  ): Promise<{ data: TwitterUser[]; meta: any }> {
    const targetUserId = userId || (await this.getUserProfile()).id
    const params = new URLSearchParams({
      "user.fields": TWITTER_USER_FIELDS.join(","),
      max_results: (options.max_results || 100).toString(),
    })

    if (options.pagination_token) {
      params.append("pagination_token", options.pagination_token)
    }

    const response = await this.makeRequest(`/users/${targetUserId}/following?${params.toString()}`)
    return {
      data: response.data || [],
      meta: response.meta || {},
    }
  }

  async getFollowers(
    userId?: string,
    options: {
      max_results?: number
      pagination_token?: string
    } = {},
  ): Promise<{ data: TwitterUser[]; meta: any }> {
    const targetUserId = userId || (await this.getUserProfile()).id
    const params = new URLSearchParams({
      "user.fields": TWITTER_USER_FIELDS.join(","),
      max_results: (options.max_results || 100).toString(),
    })

    if (options.pagination_token) {
      params.append("pagination_token", options.pagination_token)
    }

    const response = await this.makeRequest(`/users/${targetUserId}/followers?${params.toString()}`)
    return {
      data: response.data || [],
      meta: response.meta || {},
    }
  }

  async searchTweets(
    query: string,
    options: {
      max_results?: number
      next_token?: string
      since_id?: string
      until_id?: string
      start_time?: string
      end_time?: string
    } = {},
  ): Promise<{ data: TwitterTweet[]; meta: any }> {
    const params = new URLSearchParams({
      query,
      "tweet.fields": TWITTER_TWEET_FIELDS.join(","),
      "media.fields": TWITTER_MEDIA_FIELDS.join(","),
      "user.fields": TWITTER_USER_FIELDS.join(","),
      expansions: "attachments.media_keys,author_id",
      max_results: (options.max_results || 10).toString(),
    })

    if (options.next_token) params.append("next_token", options.next_token)
    if (options.since_id) params.append("since_id", options.since_id)
    if (options.until_id) params.append("until_id", options.until_id)
    if (options.start_time) params.append("start_time", options.start_time)
    if (options.end_time) params.append("end_time", options.end_time)

    const response = await this.makeRequest(`/tweets/search/recent?${params.toString()}`)
    return {
      data: response.data || [],
      meta: response.meta || {},
    }
  }
}
