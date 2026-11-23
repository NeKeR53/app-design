import { Button, Sidebar } from "socle-ui";
import { Internal } from "socle-ui/src/components/Button/Button";
import { Dialog } from "react-aria-components";
import { useButton } from "@react-aria/button";

const accent = "#3366ff";
const shadow = `0 1px 2px rgb(0 0 0 / 10%)`;

export function Bad() {
  return (
    <>
      <Button style={{ color: accent }} label="Ok" />
      <Sidebar.Item className="x" label={shadow}>
        <p />
      </Sidebar.Item>
      <Dialog />
      <Internal />
      <p style={{ color: "red" }} title="hsl(0 50% 50%)">{String(useButton)}</p>
    </>
  );
}
