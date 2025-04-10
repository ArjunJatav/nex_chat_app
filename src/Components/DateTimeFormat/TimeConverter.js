import React from "react";
import { useTranslation } from "react-i18next";
import { Text } from "react-native";
import { font } from "../Fonts/Font";

export function TimeConverter({ isoTime }) {
  const date = new Date(isoTime);
  const today = new Date();
  const isToday =
    date.getDate() === today.getDate() &&
    date.getMonth() === today.getMonth() &&
    date.getFullYear() === today.getFullYear();

  let formattedTime;

  if (isToday) {
    const hours = date.getHours();
    const minutes = date.getMinutes();
    const ampm = hours >= 12 ? "PM" : "AM";
    const hours12 = hours % 12 || 12;
    const formattedMinutes = minutes.toString().padStart(2, "0");
    formattedTime = `${hours12}:${formattedMinutes} ${ampm}`;
  } else {
    const options = { year: "numeric", month: "long", day: "numeric" };
    const formattedDate = date.toLocaleDateString(undefined, options);
    const [month, day, year] = formattedDate.split(" ");
    formattedTime = `${month} ${day.replace(",", "")}, ${year}`;
  }

  return (
    <Text style={{ fontSize: 12, fontFamily: font.medium() }}>
      {formattedTime}
    </Text>
  );
}

export function StoryTimeConverter({ isoTime }) {
  const { t, i18n } = useTranslation();
  const date = new Date(isoTime);
  const currentDate = new Date();
  const timeDifference = (currentDate - date) / 1000; // Time difference in seconds

  if (timeDifference < 60) {
    return (
      <Text style={{ color: "white", fontSize: 14,fontFamily: font.bold(), }}>{t("just_now")}</Text>
    );
  } else if (timeDifference < 3600) {
    const minutesAgo = Math.floor(timeDifference / 60);
    return (
      <Text style={{ color: "white", fontSize: 14, fontFamily: font.bold(), }}>
        {`${minutesAgo} ${minutesAgo === 1 ? t("minute") : t("minutes")} `}
        {t("ago")}
      </Text>
    );
  } else if (timeDifference < 86400) {
    const hoursAgo = Math.floor(timeDifference / 3600);
    return (
      <Text style={{ color: "white", fontSize: 14,fontFamily: font.bold(), }}>
        {`${hoursAgo} ${hoursAgo === 1 ? t("hour") : t("hours")} `}
        {t("ago")}
      </Text>
    );
  } else {
    // You can add more cases for days, weeks, months, etc. as needed
    // Example for "X days ago":
    const daysAgo = Math.floor(timeDifference / 86400);
    return (
      <Text style={{ color: "white", fontSize: 14,fontFamily: font.bold(), }}>
        {`${daysAgo} ${daysAgo === 1 ? "day" : "days"} `}
        {t("ago")}
      </Text>
    );
  }
}

export function MyStoryTimeConverter({ isoTime, textColor }) {
  const date = new Date(isoTime);
  const { t, i18n } = useTranslation();
  const currentDate = new Date();
  const timeDifference = (currentDate - date) / 1000; // Time difference in seconds
  const textStyle = {
    color: textColor, // Use the provided textColor prop
    marginBottom: 0,
    fontSize: 14,
    fontFamily: font.bold(),
    paddingLeft: 10,
    height: 20,
  };

  if (timeDifference < 60) {
    return <Text style={textStyle}>{t("just_now")}</Text>;
  } else if (timeDifference < 3600) {
    const minutesAgo = Math.floor(timeDifference / 60);
    return (
      <Text style={textStyle}>
        {`${minutesAgo} ${minutesAgo === 1 ? t("minute") : t("minutes")} `}
        {t("ago")}
      </Text>
    );
  } else if (timeDifference < 86400) {
    const hoursAgo = Math.floor(timeDifference / 3600);
    return (
      <Text style={textStyle}>
        {`${hoursAgo} ${hoursAgo === 1 ? t("hour") : t("hours")} `}
        {t("ago")}
      </Text>
    );
  } else {
    // You can add more cases for days, weeks, months, etc. as needed
    // Example for "X days ago":
    const daysAgo = Math.floor(timeDifference / 86400);
    return (
      <Text style={textStyle}>
        {`${daysAgo} ${daysAgo === 1 ? "day" : "days"} `}
        {t("ago")}
      </Text>
    );
  }
}

export function StoryTimeConverter2({ isoTime }) {
  const date = new Date(isoTime);
  const { t, i18n } = useTranslation();
  const currentDate = new Date();
  const timeDifference = (currentDate - date) / 1000; // Time difference in seconds

  if (timeDifference < 60) {
    return (
      <Text style={{ color: "grey", fontSize: 14, paddingLeft: 10,fontFamily: font.bold(), }}>
        {t("just_now")}
      </Text>
    );
  } else if (timeDifference < 3600) {
    const minutesAgo = Math.floor(timeDifference / 60);
    return (
      <Text style={{ color: "grey", fontSize: 14, paddingLeft: 10,fontFamily: font.bold(), }}>
        {`${minutesAgo} ${minutesAgo === 1 ? t("minute") : "minutes"} `}
        {t("ago")}
      </Text>
    );
  } else if (timeDifference < 86400) {
    const hoursAgo = Math.floor(timeDifference / 3600);
    return (
      <Text style={{ color: "grey", fontSize: 14, paddingLeft: 10,fontFamily: font.bold(), }}>
        {`${hoursAgo} ${hoursAgo === 1 ? t("hour") : t("hours")} `}
        {t("ago")}
      </Text>
    );
  } else {
    // You can add more cases for days, weeks, months, etc. as needed
    // Example for "X days ago":
    const daysAgo = Math.floor(timeDifference / 86400);
    return (
      <Text style={{ color: "grey", fontSize: 14, paddingLeft: 10 ,fontFamily: font.bold(),}}>
        {`${daysAgo} ${daysAgo === 1 ? "day" : "days"} `}
        {t("ago")}
      </Text>
    );
  }
}

export function StoryTimeConverter3({ formattedTime }) {
  const { t } = useTranslation();
  const date = new Date(formattedTime);
  const currentDate = new Date();
  const timeDifference = (currentDate - date) / 1000; // Time difference in seconds
  if (timeDifference < 60) {
    return (
      <Text
        style={{
          color: "grey",
          fontSize: 10,
          margin: 0,
          fontFamily: font.semibold(),
        }}
      >
        {t("just_now")}
      </Text>
    );
  } else if (timeDifference < 3600) {
    const minutesAgo = Math.floor(timeDifference / 60);
    return (
      <Text style={{ color: "grey", fontSize: 12,fontFamily: font.bold(), }}>
        {`${minutesAgo} ${minutesAgo === 1 ? t("minute") : t("minutes")} `}
        {t("ago")}
      </Text>
    );
  } else if (timeDifference < 86400) {
    const hoursAgo = Math.floor(timeDifference / 3600);
    return (
      <Text style={{ color: "grey", fontSize: 12,fontFamily: font.bold(), }}>
        {`${hoursAgo} ${hoursAgo === 1 ? t("hour") : t("hours")} `}
        {t("ago")}
      </Text>
    );
  } else {
    // You can add more cases for days, weeks, months, etc. as needed
    // Example for "X days ago":
    const daysAgo = Math.floor(timeDifference / 86400);
    return (
      <Text style={{ color: "grey", fontSize: 14,fontFamily: font.bold(), }}>
        {`${daysAgo} ${daysAgo === 1 ? t("day") : t("days")} `}
        {t("ago")}
      </Text>
    );
  }
}
function convertToISO8601(datetimeString) {
  // Parse the input datetime string assuming it is in local time
  const localDate = new Date(datetimeString);

  // Extract the date components in UTC
  const year = localDate.getUTCFullYear();
  const month = String(localDate.getUTCMonth() + 1).padStart(2, '0');
  const day = String(localDate.getUTCDate()).padStart(2, '0');
  const hours = String(localDate.getUTCHours()).padStart(2, '0');
  const minutes = String(localDate.getUTCMinutes()).padStart(2, '0');
  const seconds = String(localDate.getUTCSeconds()).padStart(2, '0');

  // Construct the ISO 8601 string with zeroed fractional seconds
  const isoString = `${year}-${month}-${day}T${hours}:${minutes}:${seconds}.000000Z`;

  return isoString;
}