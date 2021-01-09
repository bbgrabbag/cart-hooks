import React, { ChangeEvent } from "react";
import {
  DefaultFieldValues,
  DefaultFormatterKeys,
  defaultFormatterMap,
  DefaultValidatorKeys,
  defaultValidatorMap,
  Form,
  FormatterMap,
  useFormFactory,
} from "./lib";

function App(): React.ReactElement {
  const entity = { id: null };
  const formControls = useFormFactory({
    validatorMap: defaultValidatorMap,
    formatterMap: defaultFormatterMap,
  })(
    {
      id: {
        type: DefaultFormatterKeys.Text,
        validators: [DefaultValidatorKeys.Required],
      },
    },
    entity
  );

  const handleChange = (e: ChangeEvent) => {
    const { target } = e;
    const input = target as HTMLInputElement;
    formControls.updateField(
      input.name as keyof typeof formControls["entity"],
      input.value
    );
  };

  console.log(formControls.entity);

  return (
    <div>
      <Form>
        <div>
          <label htmlFor="">TEXT:</label>
          <input
            type="text"
            name="id"
            value={formControls.fieldControls.id.displayValue}
            onChange={handleChange}
          />
          <p>
            Field Status: 
            {formControls.fieldControls.id.errors.map((e, i) => (
              <span key={i}>{e}</span>
            ))}
            {!formControls.fieldControls.id.errors.length && "VALID"}
          </p>
        </div>

        <p>Form Status: {formControls.isValid ? "VALID" : "INVALID"}</p>
        <p>Entity: {JSON.stringify(formControls.entity)}</p>
      </Form>
    </div>
  );
}

export default App;
