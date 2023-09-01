import { FeatureCollection } from "geojson";
import { GetServerSideProps } from "next";
import Head from "next/head";
import { fetcher } from "src/fetcher";
import useSWR from "swr";
import SessionMap from "../components/SessionMap";
import styles from "./index.module.css";

const emptyFeatureCollection: FeatureCollection = {
  type: "FeatureCollection",
  features: [],
};

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
  const { data: transactions = emptyFeatureCollection } =
    useSWR<FeatureCollection>("/api/transactions", {
      fetcher,
      refreshInterval: 3000,
    });

  return (
    <div className={styles.container}>
      <Head>
        <title>Mapbox playground</title>
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <SessionMap accessToken={mapboxToken} transactions={transactions} />
    </div>
  );
}
