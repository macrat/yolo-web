import Link from "next/link";
import type { BlogPostMeta } from "@/blog/_lib/blog";
import { CATEGORY_LABELS } from "@/blog/_lib/blog";
import { formatDate } from "@/lib/date";
import TagList from "./TagList";
import styles from "./BlogCard.module.css";

interface BlogCardProps {
  post: BlogPostMeta;
}

export default function BlogCard({ post }: BlogCardProps) {
  return (
    <article className={styles.card}>
      {/* lgtm[js/stored-xss] - blog slugs from local markdown files, not user input */}
      <Link href={`/blog/${post.slug}`} className={styles.link}>
        <div className={styles.meta}>
          <span className={styles.category}>
            {CATEGORY_LABELS[post.category]}
          </span>
          <time className={styles.date} dateTime={post.published_at}>
            {formatDate(post.published_at)}
          </time>
          <span className={styles.readingTime}>
            {post.readingTime}分で読める
          </span>
        </div>
        <h2 className={styles.title}>{post.title}</h2>
        <p className={styles.description}>{post.description}</p>
      </Link>
      <TagList tags={post.tags} />
    </article>
  );
}
