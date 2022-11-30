import Link from "next/link";
import { useRouter } from "next/router";

export default ({ messages }) => {
  const router = useRouter();
  return (
    <div>
        <h1>{router.locale}</h1>
      <div
        onClick={() =>
          router.push(
            { query: { ...router.query, slug: ["fr", "fr"] } },
            undefined,
            { locale: "fr" }
          )
        }
      >
        Go to localised fr fr page with query approach
      </div>
      <div
        onClick={() =>
          router.push(
            '/fr/fr',
            undefined,
            { locale: "fr" }
          )
        }
      >
        Go to localised fr fr page without query
      </div>
      <Link href="/nigeria">Open nigeria clp</Link>
      <p>{messages.test}</p>
    </div>
  );
};

export const getServerSideProps = (context) => {
  console.log({ query: context.query, params: context.params });

  return {
    props: {
      locale: context.locales[0],
      messages: {
        test: 123,
      },
    },
  };
};
