import { ConvexHttpClient } from "convex/browser"
import { api } from "@/convex/_generated/api"

export interface PostStatusUpdate {
  platformPostId: string
  platform: "instagram" | "twitter" | "facebook"
  status: "published" | "failed" | "deleted" | "edited"
  publishedAt?: number
  error?: string
  metadata?: any
}

export class PostStatusHandler {
  private convex: ConvexHttpClient

  constructor() {
    this.convex = new ConvexHttpClient(process.env.NEXT_PUBLIC_CONVEX_URL!)
  }

  /**
   * Handle post status update from webhook
   */
  async handlePostStatusUpdate(update: PostStatusUpdate): Promise<void> {
    try {
      console.log("Processing post status update:", update)

      // Find the scheduled post in our database
      const scheduledPost = await this.convex.query(api.posts.getByPlatformId, {
        platformPostId: update.platformPostId,
        platform: update.platform,
      })

      if (!scheduledPost) {
        console.log(`No scheduled post found for ${update.platform} post ${update.platformPostId}`)
        return
      }

      // Update the post status
      await this.convex.mutation(api.posts.updateStatus, {
        id: scheduledPost._id,
        status: update.status,
        publishedAt: update.publishedAt,
        error: update.error,
        metadata: update.metadata,
      })

      // Create notification for user if needed
      if (update.status === "failed") {
        await this.createFailureNotification(scheduledPost, update.error)
      } else if (update.status === "published") {
        await this.createSuccessNotification(scheduledPost)
      }

      console.log(`Updated post ${scheduledPost._id} status to ${update.status}`)
    } catch (error) {
      console.error("Error handling post status update:", error)
      throw error
    }
  }

  /**
   * Create notification for failed post
   */
  private async createFailureNotification(post: any, error?: string): Promise<void> {
    try {
      await this.convex.mutation(api.notifications.create, {
        userId: post.userId,
        teamId: post.teamId,
        type: "post_failed",
        title: "Post Failed to Publish",
        message: `Your ${post.platform} post "${post.content.substring(0, 50)}..." failed to publish. ${error || "Please try again."}`,
        actionUrl: `/posts/${post._id}`,
        metadata: {
          postId: post._id,
          platform: post.platform,
          error,
        },
      })
    } catch (error) {
      console.error("Error creating failure notification:", error)
    }
  }

  /**
   * Create notification for successful post
   */
  private async createSuccessNotification(post: any): Promise<void> {
    try {
      // Only create success notifications if user has enabled them
      const user = await this.convex.query(api.users.getById, { id: post.userId })
      if (!user?.preferences?.emailNotifications) {
        return
      }

      await this.convex.mutation(api.notifications.create, {
        userId: post.userId,
        teamId: post.teamId,
        type: "post_published",
        title: "Post Published Successfully",
        message: `Your ${post.platform} post has been published successfully!`,
        actionUrl: `/posts/${post._id}`,
        metadata: {
          postId: post._id,
          platform: post.platform,
        },
      })
    } catch (error) {
      console.error("Error creating success notification:", error)
    }
  }

  /**
   * Handle Instagram webhook events
   */
  async handleInstagramWebhook(entry: any): Promise<void> {
    try {
      if (entry.changes) {
        for (const change of entry.changes) {
          if (change.field === "media") {
            await this.handleInstagramMediaChange(change.value)
          } else if (change.field === "comments") {
            await this.handleInstagramCommentChange(change.value)
          }
        }
      }
    } catch (error) {
      console.error("Error handling Instagram webhook:", error)
    }
  }

  /**
   * Handle Instagram media changes
   */
  private async handleInstagramMediaChange(value: any): Promise<void> {
    if (value.verb === "add") {
      // New media posted
      await this.handlePostStatusUpdate({
        platformPostId: value.media_id,
        platform: "instagram",
        status: "published",
        publishedAt: Date.now(),
        metadata: value,
      })
    } else if (value.verb === "remove") {
      // Media deleted
      await this.handlePostStatusUpdate({
        platformPostId: value.media_id,
        platform: "instagram",
        status: "deleted",
        metadata: value,
      })
    }
  }

  /**
   * Handle Instagram comment changes
   */
  private async handleInstagramCommentChange(value: any): Promise<void> {
    // Update engagement metrics for the post
    try {
      await this.convex.mutation(api.posts.updateEngagement, {
        platformPostId: value.media_id,
        platform: "instagram",
        engagementType: "comment",
        increment: value.verb === "add" ? 1 : -1,
      })
    } catch (error) {
      console.error("Error updating Instagram engagement:", error)
    }
  }

  /**
   * Handle Twitter webhook events
   */
  async handleTwitterWebhook(event: any): Promise<void> {
    try {
      if (event.tweet_create_events) {
        for (const tweet of event.tweet_create_events) {
          await this.handlePostStatusUpdate({
            platformPostId: tweet.id,
            platform: "twitter",
            status: "published",
            publishedAt: new Date(tweet.created_at).getTime(),
            metadata: tweet,
          })
        }
      }

      if (event.tweet_delete_events) {
        for (const deletion of event.tweet_delete_events) {
          await this.handlePostStatusUpdate({
            platformPostId: deletion.status.id,
            platform: "twitter",
            status: "deleted",
            metadata: deletion,
          })
        }
      }

      if (event.favorite_events) {
        for (const favorite of event.favorite_events) {
          await this.convex.mutation(api.posts.updateEngagement, {
            platformPostId: favorite.favorited_status.id,
            platform: "twitter",
            engagementType: "like",
            increment: 1,
          })
        }
      }
    } catch (error) {
      console.error("Error handling Twitter webhook:", error)
    }
  }

  /**
   * Handle Facebook webhook events
   */
  async handleFacebookWebhook(entry: any): Promise<void> {
    try {
      if (entry.changes) {
        for (const change of entry.changes) {
          if (change.field === "feed") {
            await this.handleFacebookFeedChange(change.value)
          }
        }
      }
    } catch (error) {
      console.error("Error handling Facebook webhook:", error)
    }
  }

  /**
   * Handle Facebook feed changes
   */
  private async handleFacebookFeedChange(value: any): Promise<void> {
    if (value.verb === "add") {
      // New post created
      await this.handlePostStatusUpdate({
        platformPostId: value.post_id,
        platform: "facebook",
        status: "published",
        publishedAt: value.published ? value.published * 1000 : Date.now(),
        metadata: value,
      })
    } else if (value.verb === "remove") {
      // Post deleted
      await this.handlePostStatusUpdate({
        platformPostId: value.post_id,
        platform: "facebook",
        status: "deleted",
        metadata: value,
      })
    } else if (value.verb === "edited") {
      // Post edited
      await this.handlePostStatusUpdate({
        platformPostId: value.post_id,
        platform: "facebook",
        status: "edited",
        metadata: value,
      })
    }
  }
}
