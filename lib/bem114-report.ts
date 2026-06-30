export const bem114Sections = [
  {
    title: "Abstract",
    paragraphs: [
      "This paper presents an NLP-based long-short equity strategy that exploits the predictive content of earnings call language for future stock performance. The strategy is grounded in the Tone Management Hypothesis: executives at weaker firms use systematically more optimistic language than fundamentals warrant, creating a persistent and exploitable mispricing.",
      "We find that the prepared remarks and Q&A section sentiment signals produce the strongest results. The prepared remarks equal-weighted portfolio delivers an annualized return of 5.77% and alpha of 0.457% per month. The Q&A equal-weighted portfolio achieves a higher Sharpe ratio of 0.408 driven by lower volatility. Critically, further decomposition reveals that the M2 → M3 window (return between two and three months after earnings) is the most powerful holding slot. For the Q&A equal-weighted strategy, the window generates an alpha of 0.628% per month (p = 0.044), and remains statistically significant post-2017 with an alpha of 1.175% per month (p = 0.022). Moreover, both strategies exhibit near-zero market beta, confirming their market neutrality.",
    ],
  },
  {
    title: "Introduction",
    subtitle: "Background",
    paragraphs: [
      "Every fiscal quarter, most public companies host earnings calls, in which senior management discusses the firm’s recent financial performance and provides context to the numbers. Previous studies have shown that managerial sentiment is a negative indicator of future stock returns: firms with more positive tone tend to underperform, while firms with more negative tone tend to outperform (Jiang et al, 2019). This project builds on that literature by testing whether specific parts of the transcript contain more predictive information than others. Typically, earnings calls are split into two sections: a prepared remarks section, where the management gives a spiel of the company’s past performance and future outlook, and a Q&A section, where sell-side analysts and buy-side institutional investors get to ask the management questions. Rather than treating the call as a single undifferentiated document, the strategy separately studies the full transcript, the prepared remarks section, and the Q&A section to uncover more relationships between the earnings call sentiment and the corresponding stock price movement.",
    ],
  },
  {
    title: "Logic of the Strategy",
    paragraphs: [
      "As shown in previous research, management language may contain information about future firm performance not immediately priced into stocks. For this reason, we analyze earnings call transcripts using natural language processing (NLP) to extract linguistic signals and rank companies based on NLP-derived scores. By identifying language patterns for which there is a deviation in the average path of a stock between the lower and higher sentiment transcripts, we can use those signals as a leading indicator for future stock performance. The investment logic relies on a behavioral and informational interpretation of managerial language. If executives in weaker firms use unusually optimistic language to obscure poor fundamentals or manage investor expectations, a phenomenon known as the Tone Management Hypothesis, their stocks will be systematically overvalued. The strategy exploits this mispricing by longing firms with most negative linguistic signals (bottom quintile) and shorting firms with the most positive signals (top quintile). The long short return (RLS = RL - RS) captures the spread attributable to sentiment-driven mispricing.",
    ],
  },
  {
    title: "Data Description",
    subtitle: "Data Sources",
    paragraphs: [
      "The dataset is built from earnings call transcripts for the top 100 U.S. firms by market capitalization. The sample contains 4,478 transcripts spanning approximately 15 years (2005 - 2020), with the transcript text obtained through the Alpha Vantage API. These transcripts form the raw textual dataset used to measure managerial sentiment across full calls, prepared remarks, and Q&A sections. Stock return data is then collected from the CRSP Monthly Returns file, with firms matched using PERMNO identifiers to reduce errors from ticker changes or reused ticker symbols.",
      "Since CRSP provides monthly returns measured at the final trading day of each month, the trading signal is aligned to month-end returns. To avoid lookahead bias, the strategy enters positions at the end of the month in which the earnings call occurs. For example, if a firm holds an earnings call on October 15, the corresponding portfolio position begins on October 31. This timing ensures that the full transcript information would have been available before the trade is entered, while also reducing contamination from immediate post-announcement price reactions.",
    ],
  },
  {
    title: "Preprocessing",
    paragraphs: [
      "After the transcripts are collected, they are cleaned and converted into structured text features. The transcript is separated into the full earnings call, the prepared remarks section, and the Q&A section, allowing the analysis to test whether scripted management language or less-scripted, more impromptu analyst interactions contain stronger predictive information. The project also constructs a sentiment shift variable, defined as Q&A sentiment minus prepared-remarks sentiment, to measure how management tone changes from the prepared portion of the call to the question-and-answer portion.",
      "Each cleaned transcript section is processed using FinBERT (Yang et al, 2020), a finance-specific version of BERT (BiDirectional Encoder Representations from Transformers) trained to classify financial text into positive, neutral, and negative sentiment categories. For each section, FinBERT assigns probabilities to the three sentiment classes (Positive, Neutral, and Negative), and the overall sentiment score is computed as Sentiment Score = P(Positive) - P(Negative). Scores near +1 indicate highly positive language, while scores near -1 indicate highly negative language.",
    ],
  },
  {
    title: "Metrics for Analysis",
    paragraphs: [
      "For each earnings call, we construct several NLP-based metrics to test which parts of managerial language are most predictive of future stock performance. The primary measure is the FinBERT sentiment score. This score is computed separately for the full earnings call, the prepared remarks section, and the Q&A section, allowing us to compare whether scripted or unscripted language contains stronger information. We also calculate sentiment shift, defined as Q&A sentiment - prepared remarks sentiment, to measure whether management tone changes when moving from controlled remarks to analyst questioning. Finally, we include a Flesch Reading Ease score as a readability metric, where higher values indicate simpler and more understandable language. These metrics are then used to sort earnings calls into quintiles and evaluate whether low- and high-sentiment firms experience different future excess returns.",
    ],
  },
  {
    title: "Presenting the Fact",
    subtitle: "Quintile Analysis and Holding Periods",
    paragraphs: [
      "To assess the predictive validity of each signal before constructing a full portfolio, we first examine the average cumulative excess returns of stocks sorted into quintiles by their NLP-derived scores across multiple holding periods (1, 2, and 3 months). In each case, Q1 represents the bottom quintile (lowest/most negative sentiment) and Q5 represents the top quintile (highest/most positive sentiment).",
    ],
  },
  {
    title: "Interpretation",
    paragraphs: [
      "Based on the results of the initial signal-based analysis, we find that the prepared remarks sentiment and Q&A sentiment emerge as strong predictors with statistically significant spreads of 1.94% and 1.43%, respectively. Additionally, the direction of the spread is consistent with our hypothesis, as lower sentiment corresponds to higher returns while higher sentiment corresponds to lesser returns. The sentiment shift and readability signals do not exhibit a statistically significant pattern at any horizon, and are therefore excluded from portfolio construction.",
      "The superior performance of prepared remarks and Q&A can be explained by the nature of the two sections. Prepared remarks are carefully scripted and reviewed in advance, making them a more deliberate and strategically constructed communication. Executives at weaker firms have a greater incentive and opportunity to use optimistic framing in prepared remarks to guide investor expectations. The Q&A section provides insight into the impromptu and subconscious managerial opinions, allowing for a more genuine window in the firm’s future performance. However, while informative, the Q&A does introduce noise from analyst questioning styles, follow-up dynamics, and the off-the-cuff responses that can dilute the underlying sentiment signal, which can explain why the spread is slightly smaller compared to the prepared remarks. The failure of the sentiment shift signal suggests that the change in tone between sections does not convey incremental information beyond the section-level signals themselves, although a broader range of firms would need to be tested to effectively rule out the viability of the signal.",
      "Additionally, as shown in Figure 1 and Table 1, the spreads are generally the largest 3 months after the earnings call announcement. Based on these findings, we decided to construct portfolios for the two statistically significant signals (prepared remarks sentiment and Q&A sentiment), with a time horizon of 3 months post earnings call.",
    ],
  },
  {
    title: "Portfolio Construction",
    subtitle: "Parameters",
    paragraphs: [
      "The portfolio was constructed using a calendar-time, overlapping methodology. At each calendar month, all earnings calls that occurred during that month were ranked by their NLP-derived signal (prepared remarks sentiment or Q&A sentiment). The ranked calls were then divided into quintiles.",
      "Long Leg: Bottom Quintile (Q1) - firms with the most negative sentiment. Short Leg: Top Quintile (Q5) - firms with the most positive sentiment. Holding Period: 3 months. Universe: Top 100 U.S firms by market capitalization.",
      "Each earnings call was treated as an independent event, regardless of firm identity. This means that a single firm can appear in the portfolio multiple times across different quarters, but each instance is treated as a fresh observation. The portfolio therefore reflects sentiment-driven signals rather than firm-level persistence effects.",
      "Additionally, two weighting approaches were evaluated in parallel. 1) Equal Weighted (EW): Each stock in the long or short leg receives an equal weight of the portfolio with respect to the total number of stocks in that leg. This weights smaller-cap firms equally to large-caps and tends to amplify the signal if smaller firms are less efficiently priced. 2) Value Weighted (VW): Each stock receives weight proportional to its market capitalization relative to the total market cap of all stocks in the leg. This better reflects investability and limits the influence of smaller, more potentially illiquid names.",
    ],
  },
  {
    title: "Backtesting",
    paragraphs: [
      "The portfolio is backtested over the full available history (approximately 2005 - 2020). Since positions are held for 3 months and new positions are initiated monthly, the portfolio at any given point contains up to three overlapping cohorts of earnings calls. Portfolio returns were computed as the monthly return of the long-short spread. Risk-adjusted performance was assessed via a CAPM and Fama-French Five-Factor (FF5) regression (Fama et al., 2015), which controls for the broader overall market return, market risk (Mkt-RF), size (SMB), value (HML), profitability (RMW), and investment (CMA) factors. Additionally, the backtest records the cumulative returns of the strategy across time.",
    ],
  },
  {
    title: "Discussion",
    paragraphs: [
      "The first notable feature of the full-sample results is the near-zero market beta across all portfolio variants. The CAPM beta for the EW prepared remarks portfolio is 0.033, and 0.043 for the EW Q&A portfolio. The VW counterparts register betas of 0.08 and 0.015, respectively. These confirm that the long-short strategy is effectively market neutral, and the returns are therefore not compensation for bearing broad market risk.",
      "Examining the cumulative returns charts (Figures 2 - 5), the strategy shows clear regime dependence. Performance is strong during the 2006 - 2012 period window surrounding the 2008 financial crisis, then flattens during the 2012-2016 period, before generally deteriorating from 2017 onwards (Figures 6-7). This pattern is consistent with the hypothesis that NLP-based earnings call analysis has become increasingly commoditized. As hedge funds and quantitative desks deployed similar FinBERT-style models in the late 2010s, the sentiment mispricing alpha was progressively arbitraged away. This motivated a formal pre/post 2017 split to separate the period where the signal was relatively proprietary from the period where it had become widespread.",
      "The pre/post 2017 breakdown in Table 4 makes the regime dependence precise. Before 2017, the prepared remarks EW portfolio generated an FF5 alpha of 0.631% per month and the Q&A EW portfolio generated 0.477% per month. While they still fall short of the 5% significance threshold given the limited sub-period sample, they are more significant than the alpha over the full sample period. The same can be seen for the VW portfolios. After 2017, both strategies flip to negative alpha (-0.414% and -0.304% per month for prepared remarks, respectively), confirming that the full-sample average is being pushed upwards by the strong pre-2017 regime and diluted by the post-2017 deterioration.",
      "One natural hypothesis for this post-2017 deterioration is that FAANG stocks drove it: as Apple, Amazon, Google, Facebook (now Meta), and Netflix grew to dominate the top 100 by market capitalization, their sustained strong performance while sitting in the short leg could have mechanically suppressed value-weighted returns. However, Figure 9 (see the Appendix) rules this out as it shows that the FAANG contribution to the short leg returns (pink line) is mostly close to zero throughout the entire sample, while the non-FAANG names account for virtually all return variations in both regimes. The post-2017 deterioration is visible in the non-FAANG contribution alone, pointing instead to the broader commoditization of the NLP sentiment signal.",
      "The monthly window decomposition in Table 5 provides a further layer of insight by asking where within the 3-month holding period the return is actually generated. For the prepared remarks signal, the M1 → M2 window produces the largest alpha (0.810% per month, EW), but it is not statistically significant (p = 0.127). For the Q&A signal, however, the picture is more striking: the M2 → M3 window generates an EW FF5 alpha of 0.771% per month, significant at the 5% level (p = 0.044). The M0 → M1 and M1 → M2 windows for the Q&A sentiment produce much smaller alphas of 0.201% and 0.206%, respectively. This suggests that the Q&A sentiment signal is a slow-moving predictor: the market takes two full months to begin meaningfully incorporating the information embedded in the unscripted analyst exchange, with most of the price correction occurring in the third month.",
      "Table 6 further decomposes the Q&A M2 → M3 window by regime. Pre-2017, the alpha is 0.611% (p = 0.186%), which is positive but not independently significant. Post-2017, the alpha rises to 1.175% per month (p = 0.022), achieving strong statistical significance. This is the most striking finding of the study. Rather than being eliminated by the spread of NLP tools, the M2 → M3 Q&A window appears to have strengthened after 2017. One potential explanation is that as fast-moving algorithmic strategies more aggressively front-run the immediate post-earnings sentiment signal (depressing early-window returns, as evidenced by the M0 → M1 alpha of -2.186% post-2017), the residual longer-horizon information in the Q&A section becomes relatively more valuable and less-contested. The price discovery process for Q&A-embedded information may be more gradual and less susceptible to crowding than the immediate transcript-scanning that characterizes modern earnings-event strategies.",
      "Taken together, the results show that the overall strategy is suggestive of alpha within the sentiment-driven mispricing during earnings calls but not fully conclusive given the statistical insignificance. Further analysis of the results show, however, that the aggregate 3-month strategy obscures a powerful, statistically significant signal concentrated in the final month of the holding window on Q&A sentiment. With further testing and refinements, this can be a viable trading strategy for hedge funds to adopt and make significant alpha.",
    ],
  },
  {
    title: "Risks & Potential Solutions",
    paragraphs: [
      "Sample Size and Universe Constraints. The sample for this study covers only the top 100 U.S. firms by market capitalization. This is a narrow universe that may not generalize to mid- or small-cap stocks, where information asymmetry and sentiment-driven mispricing may be more pronounced or liquidity constraints may make execution more difficult. A solution to this is to expand coverage to a broader universe of firms. This would increase the number of observations per period, improve statistical power, and enable sector-level subsample analysis to determine whether signal is driven by particular industries.",
      "Sample Period. The CRSP data used to analyze stock returns only covers until 2020. During the 5 year gap between then and this study, this strategy may have been arbitraged away due to market competition and the increased usage of such NLP-based technologies during this time. To truly determine the viability of this strategy in the present, our backtest must include the 2021 - 2025 stock market data to ensure that our findings remain the same.",
      "Another potential concern with our sample period is that there was generally a prolonged bull market throughout much of this window, and when only examining the top 100 companies by market capitalization, there was widespread positive movement throughout our sample. This would have affected both the long and short legs of the portfolio, so data collection in other time periods would be necessary to view more universal trends.",
      "Outlier Risk From Idiosyncratic Speech patterns. Executives with distinctive or unusual speech patterns, including non-native speakers or highly formal communicators, may generate outlier sentiment scores that drive spurious quintile assignments, introducing noise into the long and short legs. One solution to this is to combine the NLP signal with complementary factors (e.g. fundamental quality, short interest, analyst dispersion) that are less susceptible to crowding. Additionally, computing trailing averages of sentiment scores across multiple calls for the same executive can help distinguish structural tone from idiosyncratic variation.",
      "Regime and Structural Break Risk. The strategy’s performance is not stable across time. The clear deterioration from 2017 onwards in the aggregate full-period portfolios (Table 4) indicates that as NLP tools have become mainstream, parts of the mispricing are being arbitraged away. However, the post-2017 strength of the M2 → M3 Q&A window suggests that the erosion is not uniform and that some slower-moving signals remain exploitable. The strategy may be susceptible to similar structural shifts in the future. This can be mitigated by continuously monitoring alpha decay through re-estimating rolling window alphas and rotating into sub-signals that show the least crowding.",
    ],
  },
  {
    title: "Future Work",
    paragraphs: [
      "Several extensions would strengthen the strategy’s predictive power and practical applicability:",
    ],
    bullets: [
      "Expand the transcript universe to cover more companies across a longer time horizon, enabling sector-level analysis and improving statistical precision.",
      "Incorporate more granular linguistic features, such as hedging frequency negation density, or the proportion of forward-looking statements, to augment the FinBERT score.",
      "Evaluate the strategy in out-of-sample periods beyond the backtest data window to assess forward-looking robustness.",
      "Investigate whether combining the Q&A M2 → M3 signal with fundamental or short interest filters improves risk-adjusted returns while maintaining statistical significance.",
    ],
  },
  {
    title: "Conclusion",
    paragraphs: [
      "Overall, this study demonstrates that disaggregating an earnings call transcript into its constituent sections yields a more powerful and statistically meaningful signal for future stock performance than treating the full call as a single document. Using NLP-derived sentiment analysis, we show that both prepared remarks and Q&A sentiment predict future excess returns in the hypothesized direction, with statistically significant Q1-Q5 spreads of 1.94% and 1.43% at a 3-month horizon.",
      "The long-short portfolios constructed on these signals generate annualized returns of 5.77% and 4.52% on an equal-weighted basis, with near-zero market beta confirming the market-neutral character of the strategy. While full-sample FF5 alphas are economically meaningful at 0.36%-0.46% per month, they do not reach conventional statistical significance, which we attribute to limited sample size and pronounced regime dependence.",
      "Crucially, further decomposition reveals that the strategy’s alpha is not uniformly distributed across time or across the holding window. The aggregate full-period results mask a concentrated, statistically significant signal in the M2 → M3 window of the Q&A equal-weighted strategy, which generates an FF5 alpha of 0.771% (p = 0.044) per month over the full sample and 1.175% (p = 0.022) per month in the post-2017 period alone. This finding suggests that the slow-moving information embedded in the more impromptu analyst exchanges is the most durable and exploitable component of earnings call language, and has not yet been eroded by the proliferation of NLP tools. These results provide a compelling foundation for further research into granular transcript features, broader firm universes, and the interaction of NLP signals with fundamental and market microstructure factors.",
    ],
  },
  {
    title: "Appendix",
    paragraphs: ["Code: Earnings Call NLP Long-Short Strategy"],
  },
  {
    title: "References",
    bullets: [
      "Fama, E. F., & French, K. R. (2015). A five-factor asset pricing model. Journal of Financial Economics, 116(1), 1-22.",
      "Jiang, F., Lee, J., Martin, X., & Zhou, G. (2019). Manager sentiment and stock returns. Journal of Financial Economics, 132(1), 126-149.",
      "Yang, Y., Uy, M. C. S., & Huang, A. (2020). FinBERT: A pretrained language model for financial communications. arXiv preprint arXiv:2006.08097.",
    ],
  },
] as const;

export const bem114Tables = {
  table1: [
    ["Overall Call Sentiment", "0.78%", "0.230"],
    ["Prepared Remarks Sentiment", "1.94%", "0.003"],
    ["Q&A Sentiment", "1.43%", "0.015"],
    ["Sentiment Shift (Prepared → Q&A)", "-0.40%", "0.570"],
    ["Overall Flesch Reading Ease", "-0.60%", "0.353"],
  ],
  table2: [
    ["Avg Monthly Return", "0.481%", "0.504%"],
    ["Annualized Return", "5.77%", "6.05%"],
    ["Monthly Volatility", "4.755%", "4.648%"],
    ["Annualized Volatility", "16.47%", "16.10%"],
    ["Annualized Sharpe", "0.350", "0.376"],
    ["CAPM Alpha (monthly)", "0.453%", "0.436%"],
    ["CAPM Beta (monthly)", "0.033", "0.08"],
    ["FF5 Alpha (monthly)", "0.457%", "0.4491%"],
    ["FF5 Alpha p-value", "0.177", "0.183"],
  ],
  table3: [
    ["Avg Monthly Return", "0.377%", "0.137%"],
    ["Annualized Return", "4.52%", "1.64%"],
    ["Monthly Volatility", "3.199%", "3.621%"],
    ["Annualized Volatility", "11.08%", "12.54%"],
    ["Annualized Sharpe", "0.408", "0.131"],
    ["CAPM Alpha (monthly)", "0.343%", "0.125%"],
    ["CAPM Beta (monthly)", "0.043", "0.015"],
    ["FF5 Alpha (monthly)", "0.356%", "0.2035%"],
    ["FF5 Alpha p-value", "0.137", "0.448"],
  ],
  table4: [
    ["Prepared Remarks Sentiment EW pre-2017", "0.6308%", "0.122"],
    ["Prepared Remarks Sentiment EW post-2017", "-0.4144%", "0.539"],
    ["Prepared Remarks Sentiment VW pre-2017", "0.5498%", "0.162"],
    ["Prepared Remarks Sentiment VW post-2017", "-0.1842%", "0.793"],
    ["Q&A Sentiment EW pre-2017", "0.4772%", "0.115"],
    ["Q&A Sentiment EW post-2017", "-0.3043%", "0.445"],
    ["Q&A Sentiment VW pre-2017", "0.3556%", "0.278"],
    ["Q&A Sentiment VW post-2017", "-0.3987%", "0.472"],
  ],
  table5: [
    ["Prepared Remarks Sentiment EW M0 → M1", "-0.1603%", "0.747"],
    ["Prepared Remarks Sentiment EW M1 → M2", "0.8100%", "0.127"],
    ["Prepared Remarks Sentiment EW M2 → M3", "0.2793%", "0.595"],
    ["Prepared Remarks Sentiment VW M0 → M1", "-0.4843%", "0.299"],
    ["Prepared Remarks Sentiment VW M1 → M2", "0.5916%", "0.276"],
    ["Prepared Remarks Sentiment VW M2 → M3", "0.1246%", "0.831"],
    ["Q&A Sentiment EW M0 → M1", "0.2006%", "0.668"],
    ["Q&A Sentiment EW M1 → M2", "0.2056%", "0.645"],
    ["Q&A Sentiment EW M2 → M3", "0.7709%", "0.044"],
    ["Q&A Sentiment VW M0 → M1", "0.272%", "0.312"],
    ["Q&A Sentiment VW M1 → M2", "0.192%", "0.516"],
    ["Q&A Sentiment VW M2 → M3", "-0.074", "0.625"],
  ],
  table6: [
    ["M0 → M1 Pre-2017", "0.4839%", "0.363"],
    ["M0 → M1 Post-2017", "-2.186%", "0.001"],
    ["M1 → M2 Pre-2017", "0.3882%", "0.428"],
    ["M1 → M2 Post-2017", "-0.7498%", "0.432"],
    ["M2 → M3 Pre-2017", "0.6111%", "0.186"],
    ["M2 → M3 Post-2017", "1.1753%", "0.022"],
  ],
} as const;
