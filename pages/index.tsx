import Head from "next/head";

import styles from "@/pages/index.module.css";
import Map from "@/components/Map";
import { GetServerSideProps } from "next";
import { Mapbox } from "@/components/Mapbox";
import { useEffect, useState } from "react";

type Props = {
  mapboxToken: string;
};

export const getServerSideProps: GetServerSideProps<Props> = async () => {
  return {
    props: {
      mapboxToken: process.env.MAPBOX_TOKEN ?? "",
    },
  };
};

export default function Home({ mapboxToken }: Props) {
  const [timestamp, setTimestamp] = useState(Date.now());

  useEffect(() => {
    const interval = setInterval(() => {
      setTimestamp(Date.now());
    }, 60000);

    return () => {
      clearInterval(interval);
    };
  }, []);

  return (
    <div className={styles.container}>
      <Head>
        <title>Mapbox mocking example</title>
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <Mapbox
        accessToken={mapboxToken}
        featuresURL={`/api/transactions?t=${timestamp}`}
      />
    </div>
  );
}
