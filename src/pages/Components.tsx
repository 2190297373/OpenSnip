import { Button, Input, Select, Modal, Tooltip, Dropdown } from "../components/ui";
import { useState } from "react";

export function Components() {
  const [modalOpen, setModalOpen] = useState(false);
  const [selectValue, setSelectValue] = useState("");

  return (
    <div className="p-8 space-y-8 bg-[var(--color-background)]">
      <h1 className="text-2xl font-bold">Component Preview</h1>

      {/* Buttons */}
      <section>
        <h2 className="text-lg font-semibold mb-3">Buttons</h2>
        <div className="flex flex-wrap gap-3">
          <Button variant="primary">Primary</Button>
          <Button variant="secondary">Secondary</Button>
          <Button variant="ghost">Ghost</Button>
          <Button variant="danger">Danger</Button>
          <Button variant="primary" size="sm">Small</Button>
          <Button variant="primary" size="lg">Large</Button>
          <Button loading>Loading</Button>
        </div>
      </section>

      {/* Inputs */}
      <section>
        <h2 className="text-lg font-semibold mb-3">Inputs</h2>
        <div className="flex flex-col gap-3 max-w-md">
          <Input label="Name" placeholder="Enter your name" />
          <Input label="With Error" placeholder="Enter..." error="This field is required" />
        </div>
      </section>

      {/* Select */}
      <section>
        <h2 className="text-lg font-semibold mb-3">Select</h2>
        <div className="max-w-xs">
          <Select
            label="Color"
            value={selectValue}
            onChange={setSelectValue}
            placeholder="Pick a color..."
            options={[
              { value: "red", label: "Red" },
              { value: "green", label: "Green" },
              { value: "blue", label: "Blue" },
            ]}
          />
        </div>
      </section>

      {/* Modal */}
      <section>
        <h2 className="text-lg font-semibold mb-3">Modal</h2>
        <Button onClick={() => setModalOpen(true)}>Open Modal</Button>
        <Modal
          open={modalOpen}
          onClose={() => setModalOpen(false)}
          title="Demo Modal"
          footer={
            <>
              <Button variant="ghost" onClick={() => setModalOpen(false)}>Cancel</Button>
              <Button onClick={() => setModalOpen(false)}>Confirm</Button>
            </>
          }
        >
          <p>This is a demo modal dialog.</p>
        </Modal>
      </section>

      {/* Tooltip */}
      <section>
        <h2 className="text-lg font-semibold mb-3">Tooltip</h2>
        <Tooltip content="This is a tooltip" position="top">
          <Button variant="secondary">Hover me</Button>
        </Tooltip>
      </section>

      {/* Dropdown */}
      <section>
        <h2 className="text-lg font-semibold mb-3">Dropdown</h2>
        <Dropdown
          trigger={<Button variant="secondary">Open Menu</Button>}
          items={[
            { id: "edit", label: "Edit" },
            { id: "copy", label: "Copy" },
            { id: "delete", label: "Delete", danger: true },
            { id: "divider1", label: "", divider: true },
            { id: "settings", label: "Settings" },
          ]}
          onSelect={(id: string) => console.log("Selected:", id)}
        />
      </section>
    </div>
  );
}
