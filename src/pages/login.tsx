import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useFormik } from "formik";
import * as Yup from "yup";
import { isAxiosError } from "axios";
import { StatusCodes } from "http-status-codes";
import { Alert, Box, Flex, Heading, IconButton, Text } from "theme-ui";
import { FiEye, FiEyeOff, FiShoppingCart } from "react-icons/fi";
import BaseInput from "../components/base/BaseInput";
import BaseButton from "../components/base/BaseButton";
import InfoPanel from "../components/InfoPanel";
import { loginAdmin } from "../api/authApi";

interface LoginFormValues {
  email: string;
  password: string;
}

// The validation rules. The messages match your design.
const validationSchema = Yup.object({
  email: Yup.string()
    .trim()
    .email("Enter a valid email.")
    .required("Please enter your email."),
  password: Yup.string().required("Please enter your password."),
});

const Login = () => {
  const navigate = useNavigate();
  const [showPassword, setShowPassword] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  const formik = useFormik<LoginFormValues>({
    initialValues: { email: "", password: "" },
    validationSchema,
    onSubmit: (values, { setSubmitting }) => {
      setErrorMessage("");

      loginAdmin({ email: values.email.trim(), password: values.password })
        .then((response) => {
          // Look for the token in the common places. Match this to your Response tab.
          const token =
            response.data?.data?.token ??
            response.data?.token ??
            response.data?.data?.accessToken ??
            response.data?.accessToken;

          // No token means the login failed, so do NOT let the user in
          if (!token) {
            setErrorMessage(
              String(
                response.data?.message ||
                  "Invalid credentials or user not found.",
              ),
            );
            return;
          }

          localStorage.setItem("token", token); // save the login
          navigate("/dashboard", { replace: true });
        }) // success: go to the dashboard
        .catch((error) => {
          // error: stay on this page and show a message
          if (isAxiosError(error) && error.response) {
            const { status, data } = error.response;

            const isCredentialError =
              status === StatusCodes.BAD_REQUEST ||
              status === StatusCodes.UNAUTHORIZED ||
              status === StatusCodes.FORBIDDEN ||
              status === StatusCodes.NOT_FOUND;

            setErrorMessage(
              isCredentialError
                ? String(
                    data?.message || "Invalid credentials or user not found.",
                  )
                : "Something went wrong. Please try again.",
            );
          } else {
            setErrorMessage(
              "Cannot reach the server. Check your internet and try again.",
            );
          }
        })
        .finally(() => {
          setSubmitting(false); // stops the button loader
        });
    },
  });

  // Show an error only after the user has visited that field
  const getError = (fieldName: keyof LoginFormValues) => {
    return formik.touched[fieldName] ? formik.errors[fieldName] : undefined;
  };

  return (
    <Flex sx={{ minHeight: "100vh" }}>
      {/* LEFT: login card */}
      <Flex
        sx={{ flex: 1, alignItems: "center", justifyContent: "center", p: 3 }}
      >
        <Box
          sx={{
            width: "100%",
            maxWidth: 480,
            p: [4, 5],
            bg: "white",
            borderRadius: "card",
            boxShadow: "0 10px 40px rgba(139,69,51,0.12)",
          }}
        >
          <Flex sx={{ alignItems: "center", gap: 2, mb: 4 }}>
            <Flex
              sx={{
                width: 40,
                height: 40,
                borderRadius: 10,
                bg: "primary",
                color: "white",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <FiShoppingCart size={20} />
            </Flex>
            <Text sx={{ fontSize: 3, fontWeight: "bold" }}>AdminShop</Text>
          </Flex>

          <Heading as="h2" sx={{ fontSize: 5 }}>
            Sign In
          </Heading>
          <Text sx={{ display: "block", mt: 1, mb: 4, color: "muted" }}>
            Access your admin dashboard to manage users.
          </Text>

          {errorMessage && <Alert>{errorMessage}</Alert>}

          <form onSubmit={formik.handleSubmit}>
            <BaseInput
              id="email"
              name="email"
              label="Email"
              placeholder="Enter email"
              value={formik.values.email}
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
              error={getError("email")}
            />

            <BaseInput
              id="password"
              name="password"
              label="Password"
              placeholder="Enter password"
              type={showPassword ? "text" : "password"}
              value={formik.values.password}
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
              error={getError("password")}
              rightElement={
                <IconButton
                  type="button"
                  aria-label="Toggle password"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? <FiEyeOff size={18} /> : <FiEye size={18} />}
                </IconButton>
              }
            />

            <Text
              sx={{
                display: "block",
                my: 3,
                textAlign: "right",
                color: "primary",
                cursor: "pointer",
              }}
            >
              Forgot password?
            </Text>

            <BaseButton text="Sign In" isLoading={formik.isSubmitting} />
          </form>
        </Box>
      </Flex>

      {/* RIGHT: info panel */}
      <InfoPanel />
    </Flex>
  );
};

export default Login;
