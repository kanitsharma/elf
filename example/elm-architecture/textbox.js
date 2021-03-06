import { input, onEnter, value } from "../../dist/main";
import { Union, Record } from "../../dist/main";

const Model = Record({
  text: String
});

// init :: Model
const Init = Model.create("Hello from textbox");

const Msg = Union({
  UpdateText: [String]
});

// update :: Model -> Msg -> Model
const Update = model =>
  Msg.case({
    UpdateText: text => ({ ...model, text })
  });

// view :: String -> TextboxMsg ->  Html TextboxMsg (String)
const View = (text, TextboxMsg) =>
  input(
    [onEnter(e => TextboxMsg.map(Msg.UpdateText(e.target.value))), value(text)],
    []
  );

export { Model, Init, Msg, Update, View };
