import { SharedListDetailClient } from "./shared-list-detail-client";

export default async function SharedListPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  return <SharedListDetailClient listId={id} />;
}
