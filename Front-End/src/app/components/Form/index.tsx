import {
  FormComboboxInput,
  FormInput,
  FormPasswordInput,
  FormFileInput,
  FormTextareaInput,
  FormInputAutoComplete,
} from "./FormInput";
import FormButton from "./FormButton";
import FormLink from "./FormLink";
import FormRoot from "./FormRoot";

export const Form = {
  Root: FormRoot,
  Button: FormButton,
  Link: FormLink,
  Input: FormInput,
  PasswordInput: FormPasswordInput,
  FileInput: FormFileInput,
  TextareaInput: FormTextareaInput,
  ComboboxInput: FormComboboxInput,
  AutoCompleteInput: FormInputAutoComplete,
};
