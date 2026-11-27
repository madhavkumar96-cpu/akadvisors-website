/*
  AK Advisors: market data
  ------------------------------------------------------------------
  This is the only file to edit when rates or news change.
  Every figure has a date and a source. Update `asOf` whenever you edit.
  Sources were checked on 23 Nov 2026. Re-check official pages before each update.
*/
window.AK_DATA = {
  asOf: "23 November 2026",
  asOfISO: "2026-11-23",      // date the figures were last checked against sources (YYYY-MM-DD)
  reviewEveryDays: 14,        // after this many days the site shows an "may be out of date" note

  /* ---------- RBI policy rates (rbi.org.in "Current Rates") ---------- */
  rbi: {
    effective: "7 October 2026",
    source: { label: "Reserve Bank of India", url: "https://www.rbi.org.in/" },
    stance: "Calibrated tightening",
    nextMpc: "2–4 December 2026",
    rates: [
      { name: "Policy repo rate", value: 5.50, note: "Raised 25 bps on 7 Oct 2026" },
      { name: "Standing deposit facility", value: 5.25 },
      { name: "Marginal standing facility", value: 5.75 },
      { name: "Bank rate", value: 5.75 },
      { name: "Cash reserve ratio", value: 3.00 },
      { name: "Statutory liquidity ratio", value: 18.00 }
    ],
    /* Ranges across banks, as published on the RBI home page */
    marketRanges: [
      { name: "Savings deposit rate", low: 2.50, high: 2.50, kind: "save" },
      { name: "Term deposit rate, over 1 year", low: 6.00, high: 6.80, kind: "save" },
      { name: "MCLR, overnight", low: 7.85, high: 8.10, kind: "borrow" },
      { name: "Base rate", low: 8.40, high: 10.00, kind: "borrow" }
    ]
  },

  /* ---------- Repo rate history (RBI MPC decisions) ---------- */
  repoHistory: [
    ["2016-01-01", 6.75], ["2016-04-05", 6.50], ["2016-10-04", 6.25], ["2017-08-02", 6.00],
    ["2018-06-06", 6.25], ["2018-08-01", 6.50], ["2019-02-07", 6.25], ["2019-04-04", 6.00],
    ["2019-06-06", 5.75], ["2019-08-07", 5.40], ["2019-10-04", 5.15], ["2020-03-27", 4.40],
    ["2020-05-22", 4.00], ["2022-05-04", 4.40], ["2022-06-08", 4.90], ["2022-08-05", 5.40],
    ["2022-09-30", 5.90], ["2022-12-07", 6.25], ["2023-02-08", 6.50], ["2025-02-07", 6.25],
    ["2025-04-09", 6.00], ["2025-06-06", 5.50], ["2025-12-05", 5.25], ["2026-10-07", 5.50]
  ],

  /* ---------- SBI MCLR (sbi.bank.in, MCLR + MCLR historical data) ---------- */
  sbi: {
    source: { label: "State Bank of India: MCLR", url: "https://sbi.bank.in/web/interest-rates/interest-rates/mclr" },
    historySource: { label: "SBI MCLR historical data", url: "https://sbi.bank.in/web/interest-rates/interest-rates/mclr-historical-data" },
    eblr: { value: "8.15% + CRP + BSP", effective: "15 October 2026", previous: "7.90% + CRP + BSP",
            source: { label: "SBI: EBLR/RLLR", url: "https://sbi.bank.in/web/interest-rates/external-benchmark-based-lending-rate" } },
    rllr: { value: "7.75% + CRP", effective: "15 October 2026" },
    current: { effective: "15 November 2026 (unchanged from 15 October 2026)",
      tenors: [["Overnight", 7.85], ["1 month", 7.85], ["3 months", 8.40], ["6 months", 8.75],
               ["1 year", 8.85], ["2 years", 8.90], ["3 years", 8.95]] },
    /* columns: date, ON, 1M, 3M, 6M, 1Y, 2Y, 3Y. Chronological order */
    columns: ["Overnight", "1 month", "3 months", "6 months", "1 year", "2 years", "3 years"],
    history: [
      ["2016-04-01",8.95,9.05,9.10,9.15,9.20,9.30,9.35],["2016-05-01",8.90,9.00,9.05,9.10,9.15,9.25,9.30],
      ["2016-07-01",8.90,9.00,9.05,9.10,9.15,9.25,9.30],["2016-08-01",8.85,8.95,9.00,9.05,9.10,9.20,9.25],
      ["2016-10-01",8.80,8.90,8.95,9.00,9.05,9.15,9.20],["2016-11-01",8.65,8.75,8.80,8.85,8.90,9.00,9.05],
      ["2017-01-01",7.75,7.85,7.90,7.95,8.00,8.10,8.15],["2017-11-01",7.70,7.80,7.85,7.90,7.95,8.05,8.10],
      ["2018-03-01",7.80,7.80,7.85,8.00,8.15,8.25,8.35],["2018-06-01",7.90,7.90,7.95,8.10,8.25,8.35,8.45],
      ["2018-09-01",8.10,8.10,8.15,8.30,8.45,8.55,8.65],["2018-10-01",8.15,8.15,8.20,8.35,8.50,8.60,8.70],
      ["2018-12-10",8.20,8.20,8.25,8.40,8.55,8.65,8.75],["2019-04-10",8.15,8.15,8.20,8.35,8.50,8.60,8.70],
      ["2019-05-10",8.10,8.10,8.15,8.30,8.45,8.55,8.65],["2019-07-10",8.05,8.05,8.10,8.25,8.40,8.50,8.60],
      ["2019-08-10",7.90,7.90,7.95,8.10,8.25,8.35,8.45],["2019-09-10",7.80,7.80,7.85,8.00,8.15,8.25,8.35],
      ["2019-10-10",7.70,7.70,7.75,7.90,8.05,8.15,8.25],["2019-11-10",7.65,7.65,7.70,7.85,8.00,8.10,8.20],
      ["2019-12-10",7.65,7.65,7.70,7.85,7.90,8.10,8.20],["2020-02-10",7.60,7.60,7.65,7.80,7.85,8.05,8.15],
      ["2020-03-10",7.45,7.45,7.50,7.70,7.75,7.95,8.05],["2020-04-10",7.10,7.10,7.15,7.35,7.40,7.60,7.70],
      ["2020-05-10",6.95,6.95,7.00,7.20,7.25,7.45,7.55],["2020-06-10",6.70,6.70,6.75,6.95,7.00,7.20,7.30],
      ["2020-07-10",6.65,6.65,6.65,6.95,7.00,7.20,7.30],["2022-04-15",6.75,6.75,6.75,7.05,7.10,7.30,7.40],
      ["2022-05-15",6.85,6.85,6.85,7.15,7.20,7.40,7.50],["2022-06-15",7.05,7.05,7.05,7.35,7.40,7.60,7.70],
      ["2022-07-15",7.15,7.15,7.15,7.45,7.50,7.70,7.80],["2022-08-15",7.35,7.35,7.35,7.65,7.70,7.90,8.00],
      ["2022-10-15",7.60,7.60,7.60,7.90,7.95,8.15,8.25],["2022-11-15",7.60,7.75,7.75,8.05,8.05,8.25,8.35],
      ["2022-12-15",7.85,8.00,8.00,8.30,8.30,8.50,8.60],["2023-01-15",7.85,8.00,8.00,8.30,8.40,8.50,8.60],
      ["2023-02-15",7.95,8.10,8.10,8.40,8.50,8.60,8.70],["2023-07-15",8.00,8.15,8.15,8.45,8.55,8.65,8.75],
      ["2023-12-15",8.00,8.20,8.20,8.55,8.65,8.75,8.85],["2024-06-15",8.10,8.30,8.30,8.65,8.75,8.85,8.95],
      ["2024-07-15",8.10,8.35,8.40,8.75,8.85,8.95,9.00],["2024-08-15",8.20,8.45,8.50,8.85,8.95,9.05,9.10],
      ["2024-10-15",8.20,8.20,8.50,8.85,8.95,9.05,9.10],["2024-11-15",8.20,8.20,8.55,8.90,9.00,9.05,9.10],
      ["2025-07-15",7.95,7.95,8.35,8.70,8.80,8.85,8.90],["2025-08-15",7.90,7.90,8.30,8.65,8.75,8.80,8.85],
      ["2025-12-15",7.85,7.85,8.25,8.60,8.70,8.75,8.80],["2026-10-15",7.85,7.85,8.40,8.75,8.85,8.90,8.95],
      ["2026-11-15",7.85,7.85,8.40,8.75,8.85,8.90,8.95]
    ]
  },

  /* ---------- India vs world ---------- */
  global: {
    policyRates: {
      asOf: "mid-November 2026",
      source: { label: "KPMG central bank scanner, Nov 2026; US Federal Reserve H.15", url: "https://kpmg.com/us/en/articles/2026/november-2026-central-bank-scanner.html" },
      rows: [
        { country: "India", bank: "RBI repo rate", value: 5.50, highlight: true },
        { country: "United Kingdom", bank: "Bank Rate", value: 4.00 },
        { country: "United States", bank: "Fed funds target (upper bound, 3.75–4.00%)", value: 4.00 },
        { country: "Euro area", bank: "ECB policy rate", value: 2.65 },
        { country: "Japan", bank: "BoJ short-term rate", value: 1.25 }
      ]
    },
    /* World Bank World Development Indicators: latest available year per country */
    savingsVsCredit: {
      source: { label: "World Bank WDI: NY.GDS.TOTL.ZS and FS.AST.PRVT.GD.ZS", url: "https://data.worldbank.org/" },
      rows: [
        { country: "India", savings: 32.6, sYear: 2025, credit: 44.0, cYear: 2025, highlight: true },
        { country: "China", savings: 43.3, sYear: 2024, credit: 194.3, cYear: 2024 },
        { country: "Vietnam", savings: 37.4, sYear: 2025, credit: 125.0, cYear: 2022 },
        { country: "Indonesia", savings: 37.2, sYear: 2025, credit: 36.3, cYear: 2025 },
        { country: "South Korea", savings: 34.3, sYear: 2025, credit: 160.4, cYear: 2024 },
        { country: "Japan", savings: 26.8, sYear: 2024, credit: 188.7, cYear: 2025 },
        { country: "Germany", savings: 24.3, sYear: 2025, credit: 77.3, cYear: 2023 },
        { country: "United States", savings: 18.5, sYear: 2024, credit: 201.3, cYear: 2025 },
        { country: "United Kingdom", savings: 18.3, sYear: 2025, credit: 112.4, cYear: 2024 },
        { country: "Brazil", savings: 17.4, sYear: 2025, credit: 75.1, cYear: 2025 },
        { country: "South Africa", savings: 15.3, sYear: 2025, credit: 89.5, cYear: 2024 },
        { country: "World", savings: 26.9, sYear: 2024, credit: 140.3, cYear: 2024, world: true }
      ]
    }
  },

  /* ---------- News: newest first. Keep each summary factual and short ---------- */
  news: [
    { date: "2026-11-23", tag: "Credit markets",
      title: "Companies tap bond market ahead of a possible further rate rise",
      summary: "Corporates raised close to ₹90,000 crore through bond private placements in November, as AAA yields eased 20–30 bps during the month.",
      source: "Reuters, via Lapaas Voice", url: "https://lapaasvoice.com/indian-companies-rush-to-raise-2-7-billion-through-bonds-ahead-of-expected-rbi-rate-hike" },
    { date: "2026-11-22", tag: "Credit markets",
      title: "Financing flows to the commercial sector rise sharply in H1 FY2026-27",
      summary: "RBI data put total resource flows to the commercial sector at ₹25.29 lakh crore in April–September 2026, against ₹16.26 lakh crore a year earlier.",
      source: "Telangana Today, citing RBI Bulletin", url: "https://telanganatoday.com/costlier-loans-challenge-corporate-financing-381acef1" },
    { date: "2026-11-20", tag: "Bank rates",
      title: "South Indian Bank raises MCLR by 5 bps",
      summary: "Revised MCLRs range from 8.25% to 9.55%, with the one-year rate at 9.55%.",
      source: "Reuters, via TradingView", url: "https://www.tradingview.com/news/reuters.com,2026:newsml_FWN46Z04T:0-south-indian-bank-revises-one-year-mclr-to-9-55-effective-nov-20/" },
    { date: "2026-11-15", tag: "Bank rates",
      title: "SBI leaves MCLR unchanged in November review",
      summary: "SBI's one-year MCLR stays at 8.85% after October's 15 bps increase.",
      source: "State Bank of India", url: "https://sbi.bank.in/web/interest-rates/interest-rates/mclr" },
    { date: "2026-11-12", tag: "Bank rates",
      title: "Bank of Baroda raises MCLR by up to 20 bps",
      summary: "Three- and six-month MCLRs move to 8.50% and 8.70%. The overnight rate is unchanged at 7.85%.",
      source: "NewsBytes", url: "https://www.newsbytesapp.com/news/business/bank-of-baroda-to-hike-mclr-rates-from-november-12-2026/tldr" },
    { date: "2026-11-07", tag: "Bank rates",
      title: "HDFC Bank raises MCLR across tenors",
      summary: "Increases of 5–15 bps, with the one-year MCLR reported at 8.45%. Several other banks raised rates in November.",
      source: "Zee Business", url: "https://www.zeebiz.com/hindi/banking/bank-loan-interest-rates-november-2026-hdfc-bank-pnb-and-4-others-hike-mclr-268654" },
    { date: "2026-10-15", tag: "Bank rates",
      title: "SBI raises MCLR by 15 bps and EBLR by 25 bps",
      summary: "One-year MCLR rises to 8.85%. EBLR moves to 8.15% + CRP + BSP following the repo rate increase.",
      source: "State Bank of India", url: "https://sbi.bank.in/web/interest-rates/external-benchmark-based-lending-rate" },
    { date: "2026-10-07", tag: "Policy",
      title: "RBI raises repo rate to 5.50%, its first increase since February 2023",
      summary: "The MPC voted unanimously for a 25 bps rise and changed its stance to calibrated tightening. SDF is 5.25%; MSF and Bank Rate are 5.75%.",
      source: "Reserve Bank of India", url: "https://www.rbi.org.in/scripts/BS_PressReleaseDisplay.aspx?prid=63839" },
    { date: "2026-03-21", tag: "MSME",
      title: "Government revises Mutual Credit Guarantee Scheme for MSME manufacturers and exporters",
      summary: "The changes aim to widen credit for plant, machinery and equipment purchases, including by exporter MSMEs.",
      source: "All India Radio News", url: "https://www.newsonair.gov.in/government-revises-mutual-credit-guarantee-scheme-to-support-msme-manufacturers-exporters" },
    { date: "2026-03-31", tag: "Credit markets",
      title: "Bank credit up 18% and NBFC credit up 16.6% year on year",
      summary: "EY's H1 2026 private credit update also reports large-corporate credit growth of 14% as of March 2026.",
      source: "EY India", url: "https://www.ey.com/content/dam/ey-unified-site/ey-com/en-in/insights/strategy-transactions/documents/2026/ey-private-credit-in-india-h1-2026-update.pdf" }
  ]
};
