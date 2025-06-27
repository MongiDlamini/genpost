// This is a temporary stub file to satisfy deployment requirements
// This file will be automatically generated when you run `npx convex dev`
// The real generated file will replace this stub

export const api = {
  users: {
    createUser: "users:createUser",
    getUserById: "users:getUserById",
    updateUser: "users:updateUser",
    deleteUser: "users:deleteUser",
  },
  teams: {
    createTeam: "teams:createTeam",
    getTeamById: "teams:getTeamById",
    updateTeam: "teams:updateTeam",
    deleteTeam: "teams:deleteTeam",
    inviteMember: "teams:inviteMember",
    removeMember: "teams:removeMember",
    updateMemberRole: "teams:updateMemberRole",
  },
  socialAccounts: {
    createSocialAccount: "socialAccounts:createSocialAccount",
    getSocialAccountById: "socialAccounts:getSocialAccountById",
    updateSocialAccount: "socialAccounts:updateSocialAccount",
    deleteSocialAccount: "socialAccounts:deleteSocialAccount",
    getUserSocialAccounts: "socialAccounts:getUserSocialAccounts",
    refreshToken: "socialAccounts:refreshToken",
  },
  posts: {
    createPost: "posts:createPost",
    getPostById: "posts:getPostById",
    updatePost: "posts:updatePost",
    deletePost: "posts:deletePost",
    getUserPosts: "posts:getUserPosts",
    updatePostStatus: "posts:updatePostStatus",
  },
  notifications: {
    createNotification: "notifications:createNotification",
    getUserNotifications: "notifications:getUserNotifications",
    markAsRead: "notifications:markAsRead",
    deleteNotification: "notifications:deleteNotification",
  },
  permissions: {
    checkPermission: "permissions:checkPermission",
    getUserPermissions: "permissions:getUserPermissions",
  },
} as const

export default api
