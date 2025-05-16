import { useForm } from "react-hook-form";

const VALIDATION_SCHEMAS = {
  card: {
    title: {
      required: "Title is required",
      minLength: { value: 1, message: "Title must be at least 1 character" },
      maxLength: {
        value: 100,
        message: "Title must be less than 100 characters",
      },
    },
    description: {
      maxLength: {
        value: 1000,
        message: "Description must be less than 1000 characters",
      },
    },
  },
  column: {
    title: {
      required: "Title is required",
      minLength: { value: 1, message: "Title must be at least 1 character" },
      maxLength: {
        value: 50,
        message: "Title must be less than 50 characters",
      },
    },
  },
};

export function useFormValidation(type) {
  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm({
    defaultValues: {
      title: "",
      description: "",
    },
  });

  const validationRules = VALIDATION_SCHEMAS[type];

  const registerField = (name) => {
    return register(name, validationRules[name]);
  };

  return {
    registerField,
    handleSubmit,
    errors,
    reset,
  };
}
