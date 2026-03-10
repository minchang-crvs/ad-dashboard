# ROAS 중심 멀티매체 광고 대시보드 PRD

Version: v0.3\
Date: 2026-03-09

------------------------------------------------------------------------

# 1. Product Overview

## 1.1 제품 개요

본 제품은 **Meta, Google, 네이버, 카카오, 토스 광고 매체 데이터를
통합하여 ROAS 중심으로 분석할 수 있는 대시보드 앱**이다.

특히 **모금 캠페인 단위의 통합적인 성과 분석**을 가능하게 하여, 특정
캠페인이 어떤 매체에서 가장 효율적인지를 파악할 수 있도록 지원한다.

------------------------------------------------------------------------

# 2. Problem Statement

현재 광고 성과 분석은 다음과 같은 문제를 가진다.

1.  광고 데이터가 **매체별 대시보드에 분산**
2.  동일 캠페인이 여러 매체에서 집행되어도 **통합 ROAS 분석이 어려움**
3.  캠페인 단위 의사결정이 어렵고 매체 단위 분석에 머무름

본 제품은 **캠페인 중심 분석 구조**를 제공하여 문제를 해결한다.

------------------------------------------------------------------------

# 3. Product Goals

## 3.1 캠페인 단위 통합 분석

사용자는 다음 질문에 답할 수 있어야 한다.

-   특정 모금 캠페인의 ROAS는 얼마인가
-   어떤 광고 매체의 ROAS가 높은가
-   어떤 매체에 예산을 더 배분해야 하는가

------------------------------------------------------------------------

## 3.2 매체별 ROAS 비교

하나의 캠페인에서 매체별 ROAS를 비교할 수 있다.

Example

Campaign A

-   Meta ROAS
-   Google ROAS
-   네이버 ROAS
-   카카오 ROAS
-   토스 ROAS
-   전체 ROAS

------------------------------------------------------------------------

## 3.3 ROAS 이상 탐지

월별 ROAS 변화를 모니터링하여

-   ROAS 급증
-   ROAS 급락

등의 이상을 탐지한다.

특히 **ROAS가 비정상적으로 높아진 달은 데이터 이상 가능성이 있으므로
원인을 분석한다.**

------------------------------------------------------------------------

# 4. Target Users

Primary Users

-   모금 캠페인 운영자
-   퍼포먼스 마케터
-   광고 대행사

Secondary Users

-   조직 의사결정자
-   데이터 분석가

------------------------------------------------------------------------

# 5. MVP Scope

## 5.1 지원 광고 매체

-   Meta
-   Google
-   네이버
-   카카오
-   토스

------------------------------------------------------------------------

## 5.2 분석 단위

  단위          설명
  ------------- -------------
  Campaign      모금 캠페인
  Media         광고 매체
  Ad Campaign   광고 캠페인

------------------------------------------------------------------------

# 6. Core Metrics

  KPI          설명
  ------------ --------------------
  Spend        광고비
  Revenue      모금액
  ROAS         Revenue / Spend
  Conversion   약정 완료
  CPA          Spend / Conversion
  CTR          Click / Impression

------------------------------------------------------------------------

# 7. Dashboard Structure

## 7.1 Campaign Overview Dashboard

캠페인 전체 성과 요약

주요 카드

-   Total Spend
-   Total Revenue
-   Overall ROAS
-   Total Pledge Count

------------------------------------------------------------------------

## 7.2 Monthly ROAS Trend

월별 ROAS 변화를 시각화한다.

목적

-   ROAS 패턴 분석
-   이상치 탐지

특히 **ROAS가 높아진 달은 문제 발생 가능성이 있으므로 원인 분석을
수행한다.**

------------------------------------------------------------------------

## 7.3 Campaign ROAS Comparison

캠페인 간 ROAS 비교

  Campaign   Avg ROAS   Meta   Google   네이버   카카오   토스
  ---------- ---------- ------ -------- -------- -------- ------

추천 시각화

-   Grouped Bar Chart
-   Scatter Plot

------------------------------------------------------------------------

## 7.4 Campaign Detail Dashboard

특정 캠페인의 상세 분석

### Media Performance

  Media   Spend   Revenue   ROAS
  ------- ------- --------- ------

------------------------------------------------------------------------

### Funnel Analysis

모금 퍼널 구조

Landing Page Visit\
↓\
Payment Page View\
↓\
Pledge Started\
↓\
Pledge Completed

------------------------------------------------------------------------

### 매체별 Funnel 비교

  Stage      Meta   Google   네이버   카카오   토스
  ---------- ------ -------- -------- -------- ------
  Landing                                      
  Payment                                      
  Start                                        
  Complete                                     

------------------------------------------------------------------------

# 8. Filtering

사용자는 다음 기준으로 데이터를 필터링할 수 있다.

-   기간
-   캠페인
-   광고 매체

------------------------------------------------------------------------

# 9. Data Architecture

초기 버전에서는 **API Connector를 개발하지 않는다.**

대신 **Excel Upload 방식**을 사용한다.

데이터 흐름

Ad Platforms\
↓\
Excel Export\
↓\
User Upload\
↓\
Column Mapping\
↓\
Data Validation\
↓\
Analytics Database\
↓\
Dashboard

------------------------------------------------------------------------

# 10. Excel Upload Column Spec (MVP)

초기 버전에서는 **필수 컬럼 중심의 최소 스키마**를 사용한다.

각 광고 매체 Export 파일을 업로드하면 아래 공통 스키마로 변환한다.

## 필수 컬럼

  Column            설명
  ----------------- ----------------------------------------------------
  date              데이터 날짜
  campaign          모금 캠페인 이름
  media             광고 매체 (Meta / Google / 네이버 / 카카오 / 토스)
  spend             광고비
  impressions       노출
  clicks            클릭
  landing_visits    랜딩페이지 방문
  pledge_start      약정 시작
  pledge_complete   약정 완료
  revenue           모금 금액

------------------------------------------------------------------------

## 업로드 데이터 정규화 예시

Meta Export → Mapping

  Meta Column    Standard Column
  -------------- -----------------
  Amount Spent   spend
  Impressions    impressions
  Clicks         clicks

Google Export → Mapping

  Google Column   Standard Column
  --------------- -----------------
  Cost            spend
  Impressions     impressions
  Clicks          clicks

------------------------------------------------------------------------

# 11. Data Model

fact_ad_performance

  column            description
  ----------------- -------------
  date              날짜
  campaign          모금 캠페인
  media             광고 매체
  spend             광고비
  impressions       노출
  clicks            클릭
  landing_visits    랜딩 방문
  pledge_start      약정 시작
  pledge_complete   약정 완료
  revenue           모금 금액

------------------------------------------------------------------------

# 12. User Permissions

  Role     권한
  -------- ----------------
  Viewer   Dashboard 조회
  Admin    데이터 업로드

------------------------------------------------------------------------

# 13. Key User Flows

## 데이터 업로드

Login\
→ Upload Page\
→ Excel Upload\
→ Data Validation\
→ Database 저장\
→ Dashboard 반영

------------------------------------------------------------------------

## 캠페인 분석

Overview Dashboard\
→ 캠페인 선택\
→ ROAS 확인\
→ 매체 비교\
→ Funnel 분석

------------------------------------------------------------------------

# 14. Future Roadmap

## Phase 2

자동 데이터 수집

-   Meta Ads API
-   Google Ads API
-   네이버 Ads API
-   카카오 Ads API

------------------------------------------------------------------------

## Phase 3

광고 최적화 기능

-   ROAS anomaly detection
-   캠페인 추천
-   예산 배분 추천

------------------------------------------------------------------------

# 15. Recommended Tech Stack

Frontend

-   Next.js
-   React
-   Typescript

Backend

-   Python
-   FastAPI

Database

-   PostgreSQL
-   BigQuery (optional)

Visualization

-   Recharts
-   ECharts
