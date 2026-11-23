import "socle-ui/styles.css";
import { Button } from "socle-ui";
import { Local } from "./local";

export function Good() {
  return (
    <>
      <Button label="Ok" icon={<span className="icon" />} />
      <ButtonGroup className="group" />
      <Local style={{ width: 120 }} title="#issue" />
      <div className="text-fg" style={{ gap: "var(--gap)" }} />
      {/* biome-ignore lint/plugin: composant d'une autre librairie, même nom */}
      <Button className="exception" />
    </>
  );
}
