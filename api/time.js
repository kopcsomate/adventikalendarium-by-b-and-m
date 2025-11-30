export default function handler(req, res) {
  const now = new Date();
  const budapestTime = new Date(
    now.toLocaleString("en-US", { timeZone: "Europe/Budapest" })
  );

  res.status(200).json({
    day: budapestTime.getDate(),
    month: budapestTime.getMonth() + 1,
    iso: budapestTime.toISOString()
  });
}
