import asyncHandler from "express-async-handler";
import DeviceLocation from "../model/Analytics Modules/DeviceLocation.model.js";
import DeviceInfo from "../model/Analytics Modules/DeviceInfo.model.js";
import DeviceBattery from "../model/Analytics Modules/DeviceBattery.model.js";
import DeviceScreen from "../model/Analytics Modules/DeviceScreen.model.js";
import DeviceTime from "../model/Analytics Modules/DeviceTime.model.js";
import Analytic from "../model/Analytics.model.js";
import Url from "../model/url.model.js";
import User from "../model/user.model.js";
import axios from "axios";

const getAnalytics = asyncHandler(async (req, res) => {
  try {
    const { userId } = req.body;
    const getUser = await User.findOne({ _id: userId });
    console.log("user", getUser);
    res.status(200).json({
      message: "get Analytics",
    });
  } catch (error) {
    console.log(error);
  }
});

const pushAnalytics = asyncHandler(async (req, res) => {
  try {
    const {
      urlid,
      location,
      ipAddress,
      city,
      region,
      country,
      zip,
      currency,
      isp,
      org,
      as,
      asname,
      reverse,
      proxy,
      hosting,
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

    // Creating analytics-related documents in parallel using Promise.all()
    const [
      createLocation,
      createInfo,
      createBattery,
      createScreen,
      createTime,
    ] = await Promise.all([
      DeviceLocation.create({
        location,
        ipAddress,
        city,
        region,
        country,
        zip,
        currency,
      }),
      DeviceInfo.create({
        ipAddress,
        isp,
        org,
        as,
        asname,
        reverse,
        proxy,
        hosting,
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
      }),
      DeviceBattery.create({
        batteryLevel,
        chargingStatus,
        dischargingTime,
      }),
      DeviceScreen.create({
        screenWidth,
        screenHeight,
        availableScreenWidth,
        availableScreenHeight,
        colorDepth,
        devicePixelRatio,
      }),
      DeviceTime.create({
        timeZone,
        date,
        time,
      }),
    ]);

    // Creating Analytics document
    const createAnalytics = await Analytic.create({
      deviceLocation: createLocation._id,
      deviceInfo: createInfo._id,
      deviceBattery: createBattery._id,
      deviceScreen: createScreen._id,
      deviceTime: createTime._id,
    });

    // Finding the URL associated with the user
    const getUrl = await Url.findOne({ shortId: urlid });

    if (!getUrl) {
      return res.status(404).json({ message: "URL not found for the user" });
    }

    // Updating the URL document with analytics reference
    getUrl.analytics.push(createAnalytics._id);
    await getUrl.save();

    res.status(201).json({
      message: "Analytics data pushed successfully",
    });
  } catch (error) {
    console.error("Error pushing analytics:", error.message);
    res.status(500).json({
      message: "Something went wrong",
      error: error.message,
    });
  }
});

const getAnalyticsOverview = asyncHandler(async (req, res) => {
  try {
    const { userId } = req.params;
    const getUser = await User.findOne({ _id: userId });

    if (!getUser) {
      return res.status(404).json({ message: "User not found" });
    }

    // Fetch all URLs for the user
    const getUrl = await Url.find({ _id: { $in: getUser.url } });

    let totalVisitCount = 0;
    let totalActiveLinks = 0;

    const analyticsPromises = getUrl.map(async (url) => {
      if (url.isActive) {
        totalActiveLinks++; // Count only active links
      }

      const analyticsData = await Analytic.find({
        _id: { $in: url.analytics },
      });

      totalVisitCount += analyticsData.length;
      url.analytics = analyticsData;
    });

    await Promise.all(analyticsPromises);

    res.status(200).json({
      totalURL: getUser.url.length,
      totalActiveLinks,
      totalVisitCount,
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Internal Server Error" });
  }
});

const visitAnalytics = asyncHandler(async (req, res) => {
  try {
    const userId = req.params.userId;
    const getUser = await User.findOne({ _id: userId }, { password: 0 });

    if (!getUser) {
      return res.status(404).json({ message: "User not found" });
    }

    const getUrl = await Url.find({ _id: { $in: getUser.url } });

    const analyticsIds = getUrl.flatMap((url) => url.analytics);

    const getAnalytics = await Analytic.find({ _id: { $in: analyticsIds } });

    const deviceTimeIds = getAnalytics.map((item) => item.deviceTime);

    const deviceTimes = await DeviceTime.find({ _id: { $in: deviceTimeIds } });

    let extractedTimes = deviceTimes.map((dt) => dt.date);

    const dateCounts = extractedTimes.reduce((acc, date) => {
      acc[date] = (acc[date] || 0) + 1;
      return acc;
    }, {});

    // Sort dates in ascending order
    const sortedEntries = Object.entries(dateCounts).sort(
      (a, b) =>
        new Date(a[0].split("/").reverse().join("-")) -
        new Date(b[0].split("/").reverse().join("-"))
    );

    // Extract separate arrays
    const datesArray = sortedEntries.map(([date]) => date);
    const countsArray = sortedEntries.map(([_, count]) => count);

    res.status(200).json({
      datesArray, // Array of unique sorted dates
      countsArray, // Array of corresponding counts
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Internal Server Error" });
  }
});

const getAnalyticsDeviceInfo = asyncHandler(async (req, res) => {
  try {
    const userId = req.params.userId;
    const getUser = await User.findOne({ _id: userId }, { password: 0 });

    if (!getUser) {
      return res.status(404).json({ message: "User not found" });
    }

    const getUrl = await Url.find({ _id: { $in: getUser.url } });

    const analyticsIds = getUrl.flatMap((url) => url.analytics);

    const getAnalytics = await Analytic.find({ _id: { $in: analyticsIds } });

    const deviceInfoIds = getAnalytics.map((item) => item.deviceInfo);

    const deviceInfos = await DeviceInfo.find({ _id: { $in: deviceInfoIds } });

    // Extract required fields
    let extractedInfo = deviceInfos.map((di) => ({
      deviceType: di.deviceType,
      connectionType: di.connectionType,
      platform: di.platform,
      language: di.language,
      onlineStatus: di.onlineStatus,
      vendor: di.vendor,
      deviceCores: di.deviceCores,
      deviceRAM: di.deviceRAM,
    }));

    // Function to count occurrences of any field
    const countOccurrences = (array, key) => {
      return array.reduce((acc, item) => {
        const value = item[key];
        acc[value] = (acc[value] || 0) + 1;
        return acc;
      }, {});
    };

    // Count occurrences for each field
    const deviceTypeCounts = countOccurrences(extractedInfo, "deviceType");
    const connectionTypeCounts = countOccurrences(
      extractedInfo,
      "connectionType"
    );
    const platformCounts = countOccurrences(extractedInfo, "platform");
    const languageCounts = countOccurrences(extractedInfo, "language");
    const onlineStatusCounts = countOccurrences(extractedInfo, "onlineStatus");
    const vendorCounts = countOccurrences(extractedInfo, "vendor");
    const deviceCoresCounts = countOccurrences(extractedInfo, "deviceCores");
    const deviceRAMCounts = countOccurrences(extractedInfo, "deviceRAM");

    // Convert counts into separate key and value arrays
    const formatCounts = (counts) => ({
      keys: Object.keys(counts),
      values: Object.values(counts),
    });

    res.status(200).json({
      deviceType: formatCounts(deviceTypeCounts),
      connectionType: formatCounts(connectionTypeCounts),
      platform: formatCounts(platformCounts),
      language: formatCounts(languageCounts),
      onlineStatus: formatCounts(onlineStatusCounts),
      vendor: formatCounts(vendorCounts),
      deviceCores: formatCounts(deviceCoresCounts),
      deviceRAM: formatCounts(deviceRAMCounts),
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Internal Server Error" });
  }
});

const getAnalyticsDeviceNetwork = asyncHandler(async (req, res) => {
  try {
    const userId = req.params.userId;
    const getUser = await User.findOne({ _id: userId }, { password: 0 });

    if (!getUser) {
      return res.status(404).json({ message: "User not found" });
    }

    const getUrl = await Url.find({ _id: { $in: getUser.url } });

    const analyticsIds = getUrl.flatMap((url) => url.analytics);

    const getAnalytics = await Analytic.find({ _id: { $in: analyticsIds } });

    const deviceInfoIds = getAnalytics.map((item) => item.deviceInfo);

    const deviceInfos = await DeviceInfo.find({ _id: { $in: deviceInfoIds } });

    // Extract required fields
    let extractedInfo = deviceInfos.map((di) => ({
      isp: di.isp,
      org: di.org,
      proxy: di.proxy,
      hosting: di.hosting,
    }));

    // Function to count occurrences of any field
    const countOccurrences = (array, key) => {
      return array.reduce((acc, item) => {
        const value = item[key];
        acc[value] = (acc[value] || 0) + 1;
        return acc;
      }, {});
    };

    // Count occurrences for each field
    const ispCounts = countOccurrences(extractedInfo, "isp");
    const orgCounts = countOccurrences(extractedInfo, "org");
    const proxyCounts = countOccurrences(extractedInfo, "proxy");
    const hostingCounts = countOccurrences(extractedInfo, "hosting");

    // Convert counts into separate key and value arrays
    const formatCounts = (counts) => ({
      keys: Object.keys(counts),
      values: Object.values(counts),
    });

    res.status(200).json({
      isp: formatCounts(ispCounts),
      org: formatCounts(orgCounts),
      proxy: formatCounts(proxyCounts),
      hosting: formatCounts(hostingCounts),
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Internal Server Error" });
  }
});

const getAnalyticsDeviceLocation = asyncHandler(async (req, res) => {
  try {
    const userId = req.params.userId;
    const getUser = await User.findOne({ _id: userId }, { password: 0 });

    if (!getUser) {
      return res.status(404).json({ message: "User not found" });
    }

    const getUrl = await Url.find({ _id: { $in: getUser.url } });

    const analyticsIds = getUrl.flatMap((url) => url.analytics);

    const getAnalytics = await Analytic.find({ _id: { $in: analyticsIds } });

    const deviceLocationIds = getAnalytics.map((item) => item.deviceLocation);

    const deviceLocations = await DeviceLocation.find({
      _id: { $in: deviceLocationIds },
    });

    // Extract required fields
    let extractedInfo = deviceLocations.map((dl) => ({
      city: dl.city,
      region: dl.region,
      country: dl.country,
    }));

    // Function to count occurrences of any field
    const countOccurrences = (array, key) => {
      return array.reduce((acc, item) => {
        const value = item[key];
        acc[value] = (acc[value] || 0) + 1;
        return acc;
      }, {});
    };

    // Count occurrences for each field
    const cityCounts = countOccurrences(extractedInfo, "city");
    const regionCounts = countOccurrences(extractedInfo, "region");
    const countryCounts = countOccurrences(extractedInfo, "country");

    // Convert counts into separate key and value arrays
    const formatCounts = (counts) => ({
      keys: Object.keys(counts),
      values: Object.values(counts),
    });

    res.status(200).json({
      city: formatCounts(cityCounts),
      region: formatCounts(regionCounts),
      country: formatCounts(countryCounts),
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Internal Server Error" });
  }
});

const getAnalyticsDeviceBattery = asyncHandler(async (req, res) => {
  try {
    const userId = req.params.userId;
    const getUser = await User.findOne({ _id: userId }, { password: 0 });

    if (!getUser) {
      return res.status(404).json({ message: "User not found" });
    }

    const getUrl = await Url.find({ _id: { $in: getUser.url } });

    const analyticsIds = getUrl.flatMap((url) => url.analytics);

    const getAnalytics = await Analytic.find({ _id: { $in: analyticsIds } });

    const deviceBatteryIds = getAnalytics.map((item) => item.deviceBattery);

    const deviceBatteries = await DeviceBattery.find({
      _id: { $in: deviceBatteryIds },
    });

    // Extract battery level, charging status, and discharging time
    let extractedData = deviceBatteries.map((db) => ({
      batteryLevel: db.batteryLevel,
      chargingStatus: db.chargingStatus,
      dischargingTime: db.dischargingTime,
    }));

    // Count occurrences of each battery level
    const batteryCounts = extractedData.reduce((acc, { batteryLevel }) => {
      acc[batteryLevel] = (acc[batteryLevel] || 0) + 1;
      return acc;
    }, {});

    // Sort the battery levels in ascending order
    const sortedEntries = Object.entries(batteryCounts).sort(
      (a, b) => a[0] - b[0]
    );

    // Extract separate sorted arrays
    const batteryArray = sortedEntries.map(([battery]) => Number(battery));
    const countsArray = sortedEntries.map(([_, count]) => count);

    // Count occurrences of charging status
    const chargingStatusCounts = extractedData.reduce(
      (acc, { chargingStatus }) => {
        acc[chargingStatus] = (acc[chargingStatus] || 0) + 1;
        return acc;
      },
      {}
    );

    // Convert charging status counts into separate key and value arrays
    const chargingStatusKeys = Object.keys(chargingStatusCounts);
    const chargingStatusValues = Object.values(chargingStatusCounts);

    // Count occurrences of discharging time
    const dischargingTimeCounts = extractedData.reduce(
      (acc, { dischargingTime }) => {
        acc[dischargingTime] = (acc[dischargingTime] || 0) + 1;
        return acc;
      },
      {}
    );

    // Convert discharging time counts into separate key and value arrays
    const dischargingTimeKeys = Object.keys(dischargingTimeCounts);
    const dischargingTimeValues = Object.values(dischargingTimeCounts);

    res.status(200).json({
      batteryArray, // Sorted battery levels
      countsArray, // Corresponding counts
      chargingStatusKeys, // Charging status keys (e.g., ["Yes", "No"])
      chargingStatusValues, // Charging status values (e.g., [16, 14])
      dischargingTimeKeys, // Discharging time keys (e.g., ["4 hrs", "N/A"])
      dischargingTimeValues, // Discharging time values (e.g., [2, 17])
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Internal Server Error" });
  }
});

const getAnalyticsProfile = asyncHandler(async (req, res) => {
  try {
    const userId = req.params.userId;
    const getUser = await User.findOne(
      { _id: userId },
      { password: 0, url: 0 }
    );
    res.status(200).json({
      user: getUser,
    });
  } catch (error) {
    console.log(error);
  }
});

const getAnalyticsRecentActivity = asyncHandler(async (req, res) => {
  try {
    const { userId } = req.params;
    const getUser = await User.findOne({ _id: userId }, { password: 0 });

    if (!getUser) {
      return res.status(404).json({ message: "User not found" });
    }

    const getUrl = await Url.find({ _id: { $in: getUser.url } })
      .select("redirectURL shortId createdAt")
      .sort({ createdAt: -1 }) // Sort descending (latest first)
      .limit(5); // Get only 5 recent entries

    // Format response with extracted date and time
    const formattedData = getUrl.map((item) => {
      const createdAt = new Date(item.createdAt);
      return {
        redirectURL: item.redirectURL,
        shortId: item.shortId,
        date: createdAt.toISOString().split("T")[0], // Extract Date (YYYY-MM-DD)
        time: createdAt.toTimeString().split(" ")[0], // Extract Time (HH:MM:SS)
      };
    });

    res.status(200).json({ data: formattedData });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Internal Server Error" });
  }
});

const getAnalyticsURL = asyncHandler(async (req, res) => {
  try {
    const { userId } = req.params;
    const getUser = await User.findOne({ _id: userId }, { password: 0 });

    if (!getUser) {
      return res.status(404).json({ message: "User not found" });
    }

    const getUrl = await Url.find({ _id: { $in: getUser.url } }).sort({
      createdAt: -1,
    }); // Sort in ascending order

    const formattedResponse = getUrl.map((url) => ({
      urlId: url._id,
      shortId: url.shortId,
      redirectURL: url.redirectURL,
      clicks: url.analytics.length,
      date: url.createdAt.toISOString().split("T")[0],
      isActive: url.isActive,
    }));

    res.status(200).json(formattedResponse);
  } catch (error) {
    // console.error(error);
    res.status(500).json({ message: "Internal Server Error" });
  }
});

//proxy server for ip address
const getIpAddress = asyncHandler(async (req, res) => {
  try {
    const ip = req.query.ip;
    const response = await axios.get(
      `http://ip-api.com/json/${ip}?fields=status,message,country,region,city,zip,currency,isp,org,as,asname,reverse,proxy,hosting,lat,lon`
    );
    res.json(response.data);
  } catch (error) {
    // console.error(error);
    res.status(500).json({ message: "Something went wrong" });
  }
});

export {
  getAnalytics,
  pushAnalytics,
  getAnalyticsProfile,
  getAnalyticsOverview,
  visitAnalytics,
  getAnalyticsDeviceInfo,
  getAnalyticsDeviceBattery,
  getAnalyticsDeviceNetwork,
  getAnalyticsDeviceLocation,
  getAnalyticsRecentActivity,
  getAnalyticsURL,
  getIpAddress,
};
