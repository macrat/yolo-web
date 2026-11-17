import BrowsableList from "@/components/BrowsableList";
import Section from "@/components/Section";
import { LIST_SAMPLES, listSampleBasePath } from "./samples";
import styles from "./ListSampleView.module.css";

interface ListSampleViewProps {
  id: string;
  page: number;
}

/** BrowsableList の見本のページ。一覧のページと同じく、主見出しのセクションに一覧を置く。 */
export default function ListSampleView({ id, page }: ListSampleViewProps) {
  const sample = LIST_SAMPLES[id];
  return (
    <Section>
      <h1>{sample.list.pageTitle}</h1>
      <p className={styles.note}>{sample.note}</p>
      <BrowsableList
        {...sample.list}
        basePath={listSampleBasePath(id)}
        page={page}
      />
    </Section>
  );
}
