import { useCallback, useEffect, useState } from "react";
import { useAuthContext } from "../../../context/AuthContext";
import { useSelector, useDispatch } from "react-redux";
import { RootState, AppDispatch } from "../../../store/store";
import {
  fetchUsers,
  updateUser,
  updateUserPassword,
} from "../../../store/slices/userSlice";
import {
  Box,
  Button,
  Divider,
  Grid,
  IconButton,
  Typography,
  useTheme,
  useMediaQuery,
  Container,
  RadioGroup,
  FormControlLabel,
  Radio,
  FormLabel,
  Box as MuiBox,
} from "@mui/material";
import { useAppNotifications } from "../../../components/Snackbar/Snackbar.component";
import PAGE_TITLE from "../../../constants/pageTitle.constants";
import MANAGEMENT from "../../../constants/management.constants";
import SettingsIcon from "@mui/icons-material/Settings";
import Visibility from "@mui/icons-material/Visibility";
import VisibilityOff from "@mui/icons-material/VisibilityOff";
import { User } from "../../../models/User";
import {
  validateName,
  validateEmail,
  validateUsername,
  validatePassword,
  validatePasswordMatch,
} from "../../../utils/userValidation";
import TextfieldComponent from "../../../components/Textfield/Textfield.component";
import PersonOutlinedIcon from "@mui/icons-material/PersonOutlined";
import EmailOutlinedIcon from "@mui/icons-material/EmailOutlined";
import AccountCircleOutlinedIcon from "@mui/icons-material/AccountCircleOutlined";
import InfoOutlinedIcon from "@mui/icons-material/InfoOutlined";
import { infoBox, infoIconBox, infoTitle, infoDesc, iconSx } from '../../Forms/AddEmployeeForm/styles';
import { useThemeMode } from "../../../index";

// Settings page component for user profile and password management
const Settings: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>();
  const { currentUser, setUser } = useAuthContext();
  const { users } = useSelector((state: RootState) => state.users);
  const { showNotification } = useAppNotifications();
  const theme = useTheme();
  const isSmallScreen = useMediaQuery(theme.breakpoints.down("sm"));
  const isMediumScreen = useMediaQuery(theme.breakpoints.down("md"));
  const { mode, setMode } = useThemeMode();

  const [editFields, setEditFields] = useState({
    firstName: currentUser?.firstName || "",
    lastName: currentUser?.lastName || "",
    email: currentUser?.email || "",
    username: currentUser?.username || "",
  });
  const [passwordFields, setPasswordFields] = useState({
    newPassword: "",
    confirmNewPassword: "",
  });
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmNewPassword, setShowConfirmNewPassword] = useState(false);
  const [infoError, setInfoError] = useState<string | null>(null);
  const [passwordError, setPasswordError] = useState<string | null>(null);
  const [isEditFormValid, setIsEditFormValid] = useState(false);
  const [isPasswordFormValid, setIsPasswordFormValid] = useState(false);

  useEffect(() => {
    dispatch(fetchUsers());
  }, [dispatch]);

  // Validates individual profile fields
  const validateField = useCallback((name: string, value: string) => {
    switch (name) {
      case "firstName":
      case "lastName":
        return validateName(value);
      case "email":
        return validateEmail(value);
      case "username":
        return validateUsername(value);
      default:
        return "";
    }
  }, []);

  const validatePasswordFields = useCallback(
    (fields: typeof passwordFields) => {
      const passError = validatePassword(fields.newPassword);
      const matchError = validatePasswordMatch(
        fields.newPassword,
        fields.confirmNewPassword,
      );
      if (passError) {
        setPasswordError(passError);
        return false;
      }
      if (matchError) {
        setPasswordError(matchError);
        return false;
      }
      setPasswordError(null);
      return true;
    },
    [],
  );

  useEffect(() => {
    const hasChanges =
      editFields.firstName !== currentUser?.firstName ||
      editFields.lastName !== currentUser?.lastName ||
      editFields.email !== currentUser?.email ||
      editFields.username !== currentUser?.username;

    (async () => {
      const isValid = Object.entries(editFields).every(
        ([key, value]) => validateField(key, value) === "",
      );
      setIsEditFormValid(isValid && hasChanges);
    })();
  }, [editFields, currentUser, validateField]);

  useEffect(() => {
    const hasPasswordChange =
      passwordFields.newPassword.trim() !== "" ||
      passwordFields.confirmNewPassword.trim() !== "";
    setIsPasswordFormValid(hasPasswordChange);
  }, [passwordFields]);

  const getUserByEmail = async (email: string): Promise<User | undefined> => {
    return users.find((user) => user.email === email);
  };

  // Handles email field change and checks for duplicates
  const handleEmailChange = async (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
  ) => {
    const value = e.target.value.trim();
    if (!value) return;

    const user = await getUserByEmail(value);
    if (user && user.username !== editFields.username) {
      setInfoError(MANAGEMENT.EMAIL_EXISTS);
    } else {
      setInfoError(null);
    }
  };

  const getUserByUsername = async (
    username: string,
  ): Promise<User | undefined> => {
    return users.find((user) => user.username === username);
  };

  // Handles username field change and checks for duplicates
  const handleUsernameChange = async (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
  ) => {
    const value = e.target.value.trim();
    if (!value) return;

    const user = await getUserByUsername(value);
    if (user && user.email !== editFields.email) {
      setInfoError(MANAGEMENT.USERNAME_EXISTS);
    } else {
      setInfoError(null);
    }
  };

  // Handles saving profile changes
  const handleSaveChanges = async () => {
    try {
      const updatedUser: Partial<User> = {
        ...editFields,
      };
      if (currentUser) {
        dispatch(updateUser({ id: currentUser.id, updatedUser }));
        setUser({
          id: currentUser.id,
          firstName: updatedUser.firstName || "",
          lastName: updatedUser.lastName || "",
          email: updatedUser.email || "",
          username: updatedUser.username || "",
          password: updatedUser.password || "",
          isActive: updatedUser.isActive || false,
        });
      } else {
        throw new Error("Current User is null");
      }
      showNotification(MANAGEMENT.UPDATE_SUCCESS, { severity: 'success', duration: 3000 });
    } catch (error) {
      showNotification(MANAGEMENT.UPDATE_ERROR, { severity: 'error', duration: 5000 });
    }
  };

  // Handles new password field change
  const handleNewPassword = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
  ) => {
    setPasswordFields({
      ...passwordFields,
      newPassword: e.target.value,
    });
  };

  // Handles confirm new password field change
  const handleConfirmNewPassword = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
  ) => {
    setPasswordFields({
      ...passwordFields,
      confirmNewPassword: e.target.value,
    });
  };

  // Handles toggling new password visibility
  const handleToggleNewPassword = () => {
    setShowNewPassword((prev) => !prev);
  };

  // Handles toggling confirm new password visibility
  const handleToggleConfirmNewPassword = () => {
    setShowConfirmNewPassword((prev) => !prev);
  };

  // Handles password change form submission
  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();

    const isValid = await validatePasswordFields(passwordFields);
    if (!isValid) return;

    try {
      if (currentUser) {
        dispatch(
          updateUserPassword({
            id: currentUser.id,
            password: passwordFields.newPassword,
          }),
        );
      } else {
        throw new Error("Current User is null");
      }
      setPasswordFields({
        newPassword: "",
        confirmNewPassword: "",
      });
      showNotification(MANAGEMENT.PASSWORD_UPDATE_SUCCESS, { severity: 'success', duration: 3000 });
    } catch (error) {
      showNotification(MANAGEMENT.PASSWORD_UPDATE_ERROR, { severity: 'error', duration: 5000 });
    }
  };

  return (
    <Container maxWidth="lg" sx={{ py: { xs: 2, sm: 3, md: 4 } }}>
      <MuiBox sx={{ mb: 3 }}>
        <FormLabel component="legend" sx={{ fontWeight: 700, mb: 1 }}>Tema de la aplicación</FormLabel>
        <RadioGroup
          row
          value={mode}
          onChange={e => setMode(e.target.value as "light" | "dark" | "high-contrast")}
          aria-label="theme-mode"
          name="theme-mode"
        >
          <FormControlLabel value="light" control={<Radio />} label="Claro" />
          <FormControlLabel value="dark" control={<Radio />} label="Oscuro" />
          <FormControlLabel value="high-contrast" control={<Radio />} label="Alto Contraste" />
        </RadioGroup>
      </MuiBox>
      <Box
        display="flex"
        justifyContent="space-between"
        alignItems="center"
        sx={{ mb: 3 }}
      >
        <Box
          display="flex"
          flexDirection="column"
          alignItems="flex-start"
          sx={{ mb: 2 }}
        >
          <Typography
            variant={isSmallScreen ? "h5" : "h4"}
            sx={{
              display: "flex",
              alignItems: "center",
              fontFamily: "'Urbanist', sans-serif",
              fontWeight: 800,
              color: theme.palette.text.primary,
              mb: 0.5,
              gap: 1.5,
            }}
          >
            <SettingsIcon
              fontSize={isSmallScreen ? "small" : "large"}
              sx={{ mr: 1, color: theme.palette.primary.main }}
            />
            {isSmallScreen
              ? PAGE_TITLE.SETTING_SIMPLIFIED
              : PAGE_TITLE.SETTINGS}
          </Typography>
          <Divider
            sx={{
              width: 48,
              borderBottomWidth: 3,
              borderColor: theme.palette.primary.main,
              borderRadius: 2,
              mx: "auto",
              mb: 0.5,
            }}
          />
        </Box>
      </Box>

      <Grid
        container
        spacing={{ xs: 3, sm: 4, md: 6 }}
        justifyContent="space-between"
      >
        <Grid item xs={12} lg={5}>
          <Typography
            variant="h5"
            fontWeight="bold"
            sx={{
              mb: { xs: 0.5, sm: 1 },
              fontSize: { xs: "1.25rem", sm: "1.5rem" },
              color: theme.palette.text.primary,
            }}
          >
            {MANAGEMENT.PERSONAL_INFO_TITLE}
          </Typography>
          <Typography
            variant="body2"
            color="textSecondary"
            sx={{
              mb: { xs: 2, sm: 3 },
              fontSize: { xs: "0.875rem", sm: "1rem" },
            }}
          >
            {MANAGEMENT.PERSONAL_INFO_DESC}
          </Typography>

          <Grid container spacing={{ xs: 1.5, sm: 2 }}>
            <Grid item xs={12} sm={6}>
              <TextfieldComponent
                label="Nombre"
                name="firstName"
                value={editFields.firstName}
                onChange={(e) =>
                  setEditFields({ ...editFields, firstName: e.target.value })
                }
                error={!!validateName(editFields.firstName)}
                helperText={validateName(editFields.firstName)}
                icon={
                  <PersonOutlinedIcon
                    sx={{ color: theme.palette.text.secondary }}
                  />
                }
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextfieldComponent
                label="Apellido"
                name="lastName"
                value={editFields.lastName}
                onChange={(e) =>
                  setEditFields({ ...editFields, lastName: e.target.value })
                }
                error={!!validateName(editFields.lastName)}
                helperText={validateName(editFields.lastName)}
                icon={
                  <PersonOutlinedIcon
                    sx={{ color: theme.palette.text.secondary }}
                  />
                }
              />
            </Grid>
            <Grid item xs={12}>
              <TextfieldComponent
                label="Correo electrónico"
                name="email"
                value={editFields.email}
                onChange={(e) => {
                  setEditFields({ ...editFields, email: e.target.value });
                  handleEmailChange(e);
                }}
                error={!!validateEmail(editFields.email) || !!infoError}
                helperText={infoError || validateEmail(editFields.email)}
                icon={
                  <EmailOutlinedIcon
                    sx={{ color: theme.palette.text.secondary }}
                  />
                }
              />
            </Grid>
            <Grid item xs={12}>
              <TextfieldComponent
                label="Usuario"
                name="username"
                value={editFields.username}
                onChange={(e) => {
                  setEditFields({ ...editFields, username: e.target.value });
                  handleUsernameChange(e);
                }}
                error={!!validateUsername(editFields.username) || !!infoError}
                helperText={infoError || validateUsername(editFields.username)}
                icon={
                  <AccountCircleOutlinedIcon
                    sx={{ color: theme.palette.text.secondary }}
                  />
                }
              />
            </Grid>
          </Grid>

          <Grid item xs={12} sx={{ mt: 3 }}>
            <Box sx={infoBox(theme)}>
              <Box sx={infoIconBox(theme)}>
                <InfoOutlinedIcon
                  sx={{ ...iconSx(theme), ...infoIconBox(theme) }}
                />
              </Box>
              <Box>
                <Typography sx={infoTitle(theme)}>
                  {MANAGEMENT.RECOMMENDATION_TITLE}
                </Typography>
                <Typography sx={infoDesc(theme)}>
                  {MANAGEMENT.RECOMMENDATION_DESC}
                </Typography>
              </Box>
            </Box>
          </Grid>

          <Box
            sx={{
              display: "flex",
              justifyContent: { xs: "center", sm: "flex-end" },
              gap: 2,
              mt: { xs: 2, sm: 3 },
            }}
          >
            <Button
              variant="contained"
              color="primary"
              fullWidth={isSmallScreen}
              sx={{
                minHeight: { xs: 44, sm: 48 },
                fontSize: "clamp(0.75rem, 1.25vw, 0.875rem)",
                fontWeight: 600,
                px: { xs: 2, sm: 4 },
                py: { xs: 1, sm: 1.5 },
                minWidth: { xs: "100%", sm: 140 },
              }}
              onClick={handleSaveChanges}
              disabled={!isEditFormValid || !!infoError}
            >
              {MANAGEMENT.SAVE_CHANGES}
            </Button>
          </Box>
        </Grid>

        <Grid
          item
          xs={12}
          lg={1}
          display="flex"
          justifyContent="center"
          alignItems="stretch"
          sx={{ my: { xs: 2, lg: 0 } }}
        >
          <Divider
            orientation={isMediumScreen ? "horizontal" : "vertical"}
            flexItem
            sx={{
              display: { xs: "block", lg: "block" },
              width: { xs: "100%", lg: "auto" },
              height: { xs: "auto", lg: "100%" },
            }}
          />
        </Grid>

        <Grid item xs={12} lg={5}>
          <Typography
            variant="h5"
            fontWeight="bold"
            sx={{
              mb: { xs: 0.5, sm: 1 },
              fontSize: { xs: "1.25rem", sm: "1.5rem" },
              color: theme.palette.text.primary,
            }}
          >
            {MANAGEMENT.PASSWORD_TITLE}
          </Typography>
          <Typography
            variant="body2"
            color="textSecondary"
            sx={{
              mb: { xs: 2, sm: 3 },
              fontSize: { xs: "0.875rem", sm: "1rem" },
            }}
          >
            {MANAGEMENT.PASSWORD_DESC}
          </Typography>

          <Grid container spacing={{ xs: 1.5, sm: 2 }}>
            <Grid item xs={12}>
              <TextfieldComponent
                label={MANAGEMENT.NEW_PASSWORD_LABEL}
                name="newPassword"
                type={showNewPassword ? "text" : "password"}
                value={passwordFields.newPassword}
                onChange={handleNewPassword}
                error={!!passwordError}
                helperText={passwordError}
                endAdornment={
                  <IconButton
                    onClick={handleToggleNewPassword}
                    edge="end"
                    size="small"
                  >
                    {showNewPassword ? <VisibilityOff /> : <Visibility />}
                  </IconButton>
                }
              />
            </Grid>
            <Grid item xs={12}>
              <TextfieldComponent
                label={MANAGEMENT.CONFIRM_NEW_PASSWORD_LABEL}
                name="confirmNewPassword"
                type={showConfirmNewPassword ? "text" : "password"}
                value={passwordFields.confirmNewPassword}
                onChange={handleConfirmNewPassword}
                error={!!passwordError}
                helperText={passwordError}
                endAdornment={
                  <IconButton
                    onClick={handleToggleConfirmNewPassword}
                    edge="end"
                    size="small"
                  >
                    {showConfirmNewPassword ? (
                      <VisibilityOff />
                    ) : (
                      <Visibility />
                    )}
                  </IconButton>
                }
              />
            </Grid>
          </Grid>

          <Grid item xs={12} sx={{ mt: 3 }}>
            <Box sx={infoBox(theme)}>
              <Box sx={infoIconBox(theme)}>
                <InfoOutlinedIcon
                  sx={{ ...iconSx(theme), ...infoIconBox(theme) }}
                />
              </Box>
              <Box>
                <Typography sx={infoTitle(theme)}>
                  {MANAGEMENT.PASSWORD_INFO_TITLE}
                </Typography>
                <Typography sx={infoDesc(theme)}>
                  {MANAGEMENT.PASSWORD_INFO_DESC}
                </Typography>
              </Box>
            </Box>
          </Grid>

          <Box
            sx={{
              display: "flex",
              justifyContent: { xs: "center", sm: "flex-end" },
              gap: 2,
              mt: { xs: 2, sm: 3 },
            }}
          >
            <Button
              variant="contained"
              color="primary"
              fullWidth={isSmallScreen}
              sx={{
                minHeight: { xs: 44, sm: 48 },
                fontSize: "clamp(0.75rem, 1.25vw, 0.875rem)",
                fontWeight: 600,
                px: { xs: 2, sm: 4 },
                py: { xs: 1, sm: 1.5 },
                minWidth: { xs: "100%", sm: 140 },
              }}
              onClick={handleChangePassword}
              disabled={!isPasswordFormValid}
            >
              {MANAGEMENT.CHANGE_PASSWORD}
            </Button>
          </Box>
        </Grid>
      </Grid>
    </Container>
  );
};

export default Settings;
