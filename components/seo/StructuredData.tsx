import { globalSchemas } from '@/lib/seo/schema';

type StructuredDataProps = {
  data?: Record<string, unknown> | Record<string, unknown>[];
};

export default function StructuredData({ data }: StructuredDataProps) {
  const graphs = [...globalSchemas(), ...(data ? (Array.isArray(data) ? data : [data]) : [])];

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(graphs) }}
    />
  );
}
