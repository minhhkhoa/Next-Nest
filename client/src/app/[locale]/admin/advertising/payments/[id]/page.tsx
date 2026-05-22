import AdPaymentDetailPage from "@/_pages/admin/advertising/ad-payment-detail";

export default async function Page({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  return <AdPaymentDetailPage id={id} />;
}
