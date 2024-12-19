import styled, { ThemeProvider } from "styled-components";

// Define Light and Dark Themes
export const lightTheme = {
  colors: {
    main: "#2950e4",
    secondary: "#ffffff",
    background: "#f8f9fa",
    text: "#000000",
  },
};

export const darkTheme = {
  colors: {
    main: "#ffffff",
    secondary: "#2950e4",
    background: "#121212",
    text: "#ffffff",
  },
};

// Spinner
export const Spinner = styled.div`
  border: 4px solid ${(props) => props.theme.colors.secondary};
  border-top: 4px solid ${(props) => props.theme.colors.main};
  border-radius: 50%;
  width: 30px;
  height: 30px;
  animation: spin 1s linear infinite;
  margin: 20px auto;

  @keyframes spin {
    0% {
      transform: rotate(0deg);
    }
    100% {
      transform: rotate(360deg);
    }
  }
`;

export const ThemeSwitchButton = styled.button`
  padding: 10px;
  font-size: 16px;
  background-color: ${(props) => props.theme.colors.main};
  color: ${(props) => props.theme.colors.secondary};
  border: none;
  border-radius: 50%;
  cursor: pointer;
  width: 50px;
  height: 50px;

  &:hover {
    background-color: ${(props) => props.theme.colors.secondary};
    color: ${(props) => props.theme.colors.main};
  }

  /* Desktop layout */
  @media (min-width: 481px) {
    position: absolute;
    top: 20px;
    right: 20px;
  }

  /* Mobile layout */
  @media (max-width: 480px) {
    position: absolute;
    top: 20px;
    left: 20px;
  }
`;

export const MeasurementSwitchButton = styled.button`
  padding: 10px;
  font-size: 16px;
  background-color: ${(props) => props.theme.colors.main};
  color: ${(props) => props.theme.colors.secondary};
  border: none;
  border-radius: 50%;
  cursor: pointer;
  width: 50px;
  height: 50px;

  &:hover {
    background-color: ${(props) => props.theme.colors.secondary};
    color: ${(props) => props.theme.colors.main};
  }

  /* Desktop layout */
  @media (min-width: 481px) {
    position: absolute;
    top: 80px; /* Positioned below ThemeSwitchButton */
    right: 20px;
  }

  /* Mobile layout */
  @media (max-width: 480px) {
    position: absolute;
    top: 20px;
    right: 20px; /* Align to the right on mobile */
  }
`;