import { GetServerSideProps } from "next";
import Head from "next/head";
import { useEffect, useState } from "react";
import Map from "../components/Map";
import styles from "./index.module.css";

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
  const [startTime] = useState(Date.now());
  const [requestTime, setRequestTime] = useState(Date.now());

  useEffect(() => {
    const interval = setInterval(() => {
      setRequestTime(Date.now());
    }, 3000);

    return () => {
      clearInterval(interval);
    };
  }, []);

  return (
    <div className={styles.container}>
      <Head>
        <title>Mapbox playground</title>
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <Map
        accessToken={mapboxToken}
        featuresURL={`/api/transactions?startTime=${startTime}&requestTime=${requestTime}`}
      />
    </div>
  );
}
