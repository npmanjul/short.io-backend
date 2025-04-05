import asyncHandler from "express-async-handler";
import URL from "../model/url.model.js";
import Analytics from "../model/Analytics.model.js";
import DeviceTime from "../model/Analytics Modules/DeviceTime.model.js";
import DeviceLocation from "../model/Analytics Modules/DeviceLocation.model.js";
import DeviceInfo from "../model/Analytics Modules/DeviceInfo.model.js";
import DeviceBattery from "../model/Analytics Modules/DeviceBattery.model.js";

const urlanalytics = asyncHandler(async (req, res) => {
  const { urlId } = req.params;

  const url = await URL.findOne({ _id: urlId });

  if (!url) {
    return res.status(404).json({ message: "URL not found" });
  }

  const totalClicks = await Analytics.countDocuments({
    _id: { $in: url.analytics },
  });

  res.status(200).json({
    isActive: url.isActive,
    isExpiry: url.isExpiry,
    totalClicks: totalClicks,
    expiryDate: url.expiryDate,
    expiryTime: url.expiryTime,
  });
});

const visitAnalytics = asyncHandler(async (req, res) => {
  const { urlId } = req.params;

  const url = await URL.findOne({ _id: urlId });

  if (!url) {
    return res.status(404).json({ message: "URL not found" });
  }

  const analyticsData = await Analytics.find({ _id: { $in: url.analytics } });

  const deviceTimeIds = analyticsData.map((item) => item.deviceTime);

  const deviceTimes = await DeviceTime.find({ _id: { $in: deviceTimeIds } });

  const visitDateMap = deviceTimes.reduce((acc, dt) => {
    const date = dt.date; // Extract YYYY-MM-DD
    acc[date] = (acc[date] || 0) + 1;
    return acc;
  }, {});

  const uniqueVisitDates = Object.keys(visitDateMap);
  const visitCounts = Object.values(visitDateMap);

  res.status(200).json({
    uniqueVisitDates,
    visitCounts,
  });
});

const locationAnalytics = asyncHandler(async (req, res) => {
  const { urlId } = req.params;

  const url = await URL.findOne({ _id: urlId });

  if (!url) {
    return res.status(404).json({ message: "URL not found" });
  }

  const analyticsData = await Analytics.find({ _id: { $in: url.analytics } });

  const deviceLocationIds = analyticsData.map((item) => item.deviceLocation);

  const deviceLocations = await DeviceLocation.find({
    _id: { $in: deviceLocationIds },
  });

  const cityCounts = {};
  const regionCounts = {};
  const countryCounts = {};

  deviceLocations.forEach((dl) => {
    cityCounts[dl.city] = (cityCounts[dl.city] || 0) + 1;
    regionCounts[dl.region] = (regionCounts[dl.region] || 0) + 1;
    countryCounts[dl.country] = (countryCounts[dl.country] || 0) + 1;
  });

  res.status(200).json({
    cities: Object.keys(cityCounts),
    cityCounts: Object.values(cityCounts),
    regions: Object.keys(regionCounts),
    regionCounts: Object.values(regionCounts),
    countries: Object.keys(countryCounts),
    countryCounts: Object.values(countryCounts),
  });
});

const deviceInfoAnalytics = asyncHandler(async (req, res) => {
  const { urlId } = req.params;

  const url = await URL.findOne({ _id: urlId });

  if (!url) {
    return res.status(404).json({ message: "URL not found" });
  }

  const analyticsData = await Analytics.find({ _id: { $in: url.analytics } });

  const deviceInfoIds = analyticsData.map((item) => item.deviceInfo);

  const deviceInfos = await DeviceInfo.find({ _id: { $in: deviceInfoIds } });

  const deviceTypeCounts = {};
  const connectionTypeCounts = {};
  const platformCounts = {};
  const languageCounts = {};
  const onlineStatusCounts = {};
  const vendorCounts = {};
  const deviceCoresCounts = {};
  const deviceRAMCounts = {};

  deviceInfos.forEach((di) => {
    deviceTypeCounts[di.deviceType] =
      (deviceTypeCounts[di.deviceType] || 0) + 1;
    connectionTypeCounts[di.connectionType] =
      (connectionTypeCounts[di.connectionType] || 0) + 1;
    platformCounts[di.platform] = (platformCounts[di.platform] || 0) + 1;
    languageCounts[di.language] = (languageCounts[di.language] || 0) + 1;
    onlineStatusCounts[di.onlineStatus] =
      (onlineStatusCounts[di.onlineStatus] || 0) + 1;
    vendorCounts[di.vendor] = (vendorCounts[di.vendor] || 0) + 1;
    deviceCoresCounts[di.deviceCores] =
      (deviceCoresCounts[di.deviceCores] || 0) + 1;
    deviceRAMCounts[di.deviceRAM] = (deviceRAMCounts[di.deviceRAM] || 0) + 1;
  });

  res.status(200).json({
    deviceTypes: Object.keys(deviceTypeCounts),
    deviceTypeCounts: Object.values(deviceTypeCounts),

    connectionTypes: Object.keys(connectionTypeCounts),
    connectionTypeCounts: Object.values(connectionTypeCounts),

    platforms: Object.keys(platformCounts),
    platformCounts: Object.values(platformCounts),

    languages: Object.keys(languageCounts),
    languageCounts: Object.values(languageCounts),

    onlineStatuses: Object.keys(onlineStatusCounts),
    onlineStatusCounts: Object.values(onlineStatusCounts),

    vendors: Object.keys(vendorCounts),
    vendorCounts: Object.values(vendorCounts),

    deviceCores: Object.keys(deviceCoresCounts),
    deviceCoresCounts: Object.values(deviceCoresCounts),

    deviceRAMs: Object.keys(deviceRAMCounts),
    deviceRAMCounts: Object.values(deviceRAMCounts),
  });
});

const networkInfoAnalytics = asyncHandler(async (req, res) => {
  const { urlId } = req.params;

  const url = await URL.findOne({ _id: urlId });

  if (!url) {
    return res.status(404).json({ message: "URL not found" });
  }

  const analyticsData = await Analytics.find({ _id: { $in: url.analytics } });

  const deviceInfoIds = analyticsData.map((item) => item.deviceInfo);

  const deviceInfos = await DeviceInfo.find({ _id: { $in: deviceInfoIds } });

  const ispCounts = {};
  const orgCounts = {};
  const proxyCounts = {};
  const hostingCounts = {};

  deviceInfos.forEach((di) => {
    ispCounts[di.isp] = (ispCounts[di.isp] || 0) + 1;
    orgCounts[di.org] = (orgCounts[di.org] || 0) + 1;
    proxyCounts[di.proxy] = (proxyCounts[di.proxy] || 0) + 1;
    hostingCounts[di.hosting] = (hostingCounts[di.hosting] || 0) + 1;
  });

  res.status(200).json({
    isps: Object.keys(ispCounts),
    ispCounts: Object.values(ispCounts),

    orgs: Object.keys(orgCounts),
    orgCounts: Object.values(orgCounts),

    proxies: Object.keys(proxyCounts),
    proxyCounts: Object.values(proxyCounts),

    hostings: Object.keys(hostingCounts),
    hostingCounts: Object.values(hostingCounts),
  });
});

const batteryInfoAnalytics = asyncHandler(async (req, res) => {
  const { urlId } = req.params;

  const url = await URL.findOne({ _id: urlId });

  if (!url) {
    return res.status(404).json({ message: "URL not found" });
  }

  const analyticsData = await Analytics.find({ _id: { $in: url.analytics } });

  const deviceBatteryIds = analyticsData.map((item) => item.deviceBattery);

  const deviceBatteries = await DeviceBattery.find({
    _id: { $in: deviceBatteryIds },
  });

  const batteryLevelCounts = {};
  const chargingStatusCounts = {};
  const dischargingTimeCounts = {};

  deviceBatteries.forEach((db) => {
    batteryLevelCounts[db.batteryLevel] =
      (batteryLevelCounts[db.batteryLevel] || 0) + 1;
    chargingStatusCounts[db.chargingStatus] =
      (chargingStatusCounts[db.chargingStatus] || 0) + 1;
    dischargingTimeCounts[db.dischargingTime] =
      (dischargingTimeCounts[db.dischargingTime] || 0) + 1;
  });

  res.status(200).json({
    batteryLevels: Object.keys(batteryLevelCounts),
    batteryLevelCounts: Object.values(batteryLevelCounts),
    chargingStatuses: Object.keys(chargingStatusCounts),
    chargingStatusCounts: Object.values(chargingStatusCounts),
    dischargingTimes: Object.keys(dischargingTimeCounts),
    dischargingTimeCounts: Object.values(dischargingTimeCounts),
  });
});

export {
  urlanalytics,
  visitAnalytics,
  locationAnalytics,
  deviceInfoAnalytics,
  networkInfoAnalytics,
  batteryInfoAnalytics,
};
