import { Post } from '../types';

const toTimestamp = (value?: string): number => {
  if (!value) return 0;
  const timestamp = new Date(value).getTime();
  return Number.isFinite(timestamp) ? timestamp : 0;
};

export const getPostPublishTimestamp = (post: Post): number => (
  toTimestamp(post.publishedAt)
  || toTimestamp(post.createdAt)
  || toTimestamp(post.updatedAt)
  || toTimestamp(post.date)
);

export const sortPostsByNewest = (posts: Post[]): Post[] => (
  [...posts].sort((a, b) => getPostPublishTimestamp(b) - getPostPublishTimestamp(a))
);
