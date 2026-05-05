-- DropTable: BlogPost — migrated to Payload CMS (closes #60)
-- Blog content is now managed via Payload CMS collection 'blog-posts'.
-- All 3 articles were migrated via scripts/migrate-blog-to-payload.ts.
DROP TABLE IF EXISTS "BlogPost";
