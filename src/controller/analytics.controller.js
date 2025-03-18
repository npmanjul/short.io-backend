import asyncHandler from "express-async-handler";
import DeviceLocation from "../model/Analytics Modules/DeviceLocation.model.js";
import DeviceInfo from "../model/Analytics Modules/DeviceInfo.model.js";
import DeviceBattery from "../model/Analytics Modules/DeviceBattery.model.js";
import DeviceScreen from "../model/Analytics Modules/DeviceScreen.model.js";
import DeviceTime from "../model/Analytics Modules/DeviceTime.model.js";
import Analytic from "../model/Analytics.model.js";

const getAnalytics = asyncHandler(async (req, res) => {
  try {
    res.status(200).json({
      message: "get Analytics",
    });
  } catch (error) {
    console.log(error);
  }
});

const pushAnalytics = asyncHandler(async (req, res) => {
  const {
    longitude,
    latitude,
    accuracy,
    ipAddress,
    deviceType,
    connectionType,
    downloadSpeed,
    deviceCores,
    deviceRAM,
    browser,
    platform,
    language,
    onlineStatus,
    vendor,
    batteryLevel,
    chargingStatus,
    dischargingTime,
    screenWidth,
    screenHeight,
    availableScreenWidth,
    availableScreenHeight,
    colorDepth,
    devicePixelRatio,
    timeZone,
    date,
    time,
  } = req.body;

  const createLocation = await DeviceLocation.create({
    longitude,
    latitude,
    accuracy,
  });

  const createInfo = await DeviceInfo.create({
    ipAddress,
    deviceType,
    connectionType,
    downloadSpeed,
    deviceCores,
    deviceRAM,
    browser,
    platform,
    language,
    onlineStatus,
    vendor,
  });

  const createBattery = await DeviceBattery.create({
    batteryLevel,
    chargingStatus,
    dischargingTime,
  });

  const createScreen = await DeviceScreen.create({
    screenWidth,
    screenHeight,
    availableScreenWidth,
    availableScreenHeight,
    colorDepth,
    devicePixelRatio,
  });

  const createTime = await DeviceTime.create({
    timeZone,
    date,
    time,
  });

  await Analytic.create({
    deviceLocation: createLocation._id,
    deviceInfo: createInfo._id,
    deviceBattery: createBattery._id,
    deviceScreen: createScreen._id,
    deviceTime: createTime._id,
  });

  res.status(201).json({
    message: "Analytics data pushed successfully",
  });
});

export { getAnalytics, pushAnalytics };
