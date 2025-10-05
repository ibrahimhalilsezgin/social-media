// +page.ts
export async function load({ params }) {
  return {
    title: `Blog - ${params.slug}`,
    description: "Blog yazısının açıklaması buraya gelir."
  };
}
