import { GetServerSideProps } from "next";
import Head from "next/head";
import SessionMapContainer from "src/session/SessionMapContainer";

type Props = {
  accessToken: string;
  sessionId: string;
};

export const getServerSideProps: GetServerSideProps<Props> = async (
  context,
) => {
  const accessToken = process.env.MAPBOX_TOKEN;

  if (typeof accessToken !== "string" || !accessToken) {
    throw new Error("MAPBOX_TOKEN is not set");
  }

  const { sessionId } = context.query;

  if (typeof sessionId !== "string" || !sessionId) {
    return {
      notFound: true,
    };
  }

  return {
    props: {
      accessToken,
      sessionId,
    },
  };
};

export default function MapPage({ accessToken, sessionId }: Props) {
  return (
    <>
      <Head>
        <title>Session map</title>
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <SessionMapContainer accessToken={accessToken} sessionId={sessionId} />
    </>
  );
}
