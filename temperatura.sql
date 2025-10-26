--
-- PostgreSQL database dump
--

-- Dumped from database version 17.0
-- Dumped by pg_dump version 17.0

SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET transaction_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;

SET default_tablespace = '';

SET default_table_access_method = heap;

--
-- Name: lokacije; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.lokacije (
    id integer NOT NULL,
    naziv character varying(100) NOT NULL,
    nadmorska_visina integer
);


ALTER TABLE public.lokacije OWNER TO postgres;

--
-- Name: lokacije_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.lokacije_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.lokacije_id_seq OWNER TO postgres;

--
-- Name: lokacije_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.lokacije_id_seq OWNED BY public.lokacije.id;


--
-- Name: mjerenja; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.mjerenja (
    id integer NOT NULL,
    temperatura numeric(4,2),
    lokacija_id integer,
    datum date,
    vrijeme time without time zone,
    senzor_id integer
);


ALTER TABLE public.mjerenja OWNER TO postgres;

--
-- Name: mjerenja_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.mjerenja_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.mjerenja_id_seq OWNER TO postgres;

--
-- Name: mjerenja_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.mjerenja_id_seq OWNED BY public.mjerenja.id;


--
-- Name: senzori; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.senzori (
    id integer NOT NULL,
    naziv character varying(100) NOT NULL,
    vrsta_mjerenja character varying(50),
    lokacija_id integer
);


ALTER TABLE public.senzori OWNER TO postgres;

--
-- Name: senzori_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.senzori_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.senzori_id_seq OWNER TO postgres;

--
-- Name: senzori_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.senzori_id_seq OWNED BY public.senzori.id;


--
-- Name: lokacije id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.lokacije ALTER COLUMN id SET DEFAULT nextval('public.lokacije_id_seq'::regclass);


--
-- Name: mjerenja id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.mjerenja ALTER COLUMN id SET DEFAULT nextval('public.mjerenja_id_seq'::regclass);


--
-- Name: senzori id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.senzori ALTER COLUMN id SET DEFAULT nextval('public.senzori_id_seq'::regclass);


--
-- Data for Name: lokacije; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.lokacije (id, naziv, nadmorska_visina) FROM stdin;
1	Zagreb-Tresnjevka	125
\.


--
-- Data for Name: mjerenja; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.mjerenja (id, temperatura, lokacija_id, datum, vrijeme, senzor_id) FROM stdin;
1	18.50	1	2025-10-22	22:00:00	1
2	19.00	1	2025-10-22	22:17:47	1
3	18.70	1	2025-10-23	00:25:01	1
4	18.50	1	2025-10-23	01:24:29	1
5	18.00	1	2025-10-23	02:23:53	1
6	19.50	1	2025-10-23	03:39:01	1
7	21.00	1	2025-10-23	03:41:59	1
8	22.20	1	2025-10-23	04:41:27	1
9	22.00	1	2025-10-23	05:40:50	1
10	22.20	1	2025-10-23	07:39:40	1
11	20.70	1	2025-10-23	08:11:55	1
12	19.70	1	2025-10-23	09:11:19	1
13	20.20	1	2025-10-23	10:50:25	1
14	21.00	1	2025-10-23	11:27:47	1
15	22.50	1	2025-10-23	12:09:52	1
16	22.00	1	2025-10-23	12:55:38	1
17	21.50	1	2025-10-23	13:36:47	1
18	21.00	1	2025-10-23	14:44:57	1
19	20.70	1	2025-10-23	15:43:48	1
20	20.20	1	2025-10-23	16:41:24	1
21	20.00	1	2025-10-23	17:47:11	1
22	19.00	1	2025-10-23	18:46:14	1
23	17.50	1	2025-10-23	19:41:35	1
24	17.20	1	2025-10-23	20:40:09	1
25	15.70	1	2025-10-23	21:21:01	1
26	14.20	1	2025-10-23	21:46:41	1
27	13.50	1	2025-10-23	22:11:16	1
28	13.00	1	2025-10-23	23:08:18	1
29	12.50	1	2025-10-23	23:43:08	1
30	11.50	1	2025-10-24	00:27:33	1
31	12.00	1	2025-10-24	01:26:07	1
32	11.70	1	2025-10-24	03:24:43	1
33	12.50	1	2025-10-24	04:24:08	1
34	12.00	1	2025-10-24	05:23:19	1
35	12.50	1	2025-10-24	07:21:57	1
36	14.00	1	2025-10-24	08:18:51	1
37	14.70	1	2025-10-24	08:53:04	1
38	15.00	1	2025-10-24	09:02:07	1
39	16.50	1	2025-10-24	09:38:34	1
40	17.00	1	2025-10-24	10:35:50	1
41	18.50	1	2025-10-24	11:19:48	1
42	17.00	1	2025-10-24	11:51:16	1
43	16.00	1	2025-10-24	12:50:46	1
44	16.20	1	2025-10-24	13:37:07	1
45	15.70	1	2025-10-24	15:35:53	1
46	15.20	1	2025-10-24	16:05:49	1
47	16.70	1	2025-10-24	16:15:08	1
48	15.50	1	2025-10-24	17:07:40	1
49	15.50	1	2025-10-24	17:13:08	1
50	15.50	1	2025-10-24	17:42:17	1
51	15.20	1	2025-10-24	18:07:07	1
52	15.50	1	2025-10-24	19:06:34	1
53	15.50	1	2025-10-24	19:30:59	1
54	14.70	1	2025-10-24	19:56:36	1
55	13.70	1	2025-10-24	20:54:32	1
56	13.00	1	2025-10-24	21:53:24	1
57	11.70	1	2025-10-24	22:52:46	1
58	11.50	1	2025-10-24	23:52:25	1
59	11.70	1	2025-10-25	00:44:04	1
60	12.00	1	2025-10-25	02:42:14	1
61	11.50	1	2025-10-25	04:14:10	1
62	11.20	1	2025-10-25	05:13:28	1
63	12.00	1	2025-10-25	06:12:44	1
64	12.20	1	2025-10-25	07:12:01	1
65	13.00	1	2025-10-25	08:11:17	1
66	13.50	1	2025-10-25	09:10:34	1
67	13.70	1	2025-10-25	10:10:05	1
68	12.50	1	2025-10-25	11:09:16	1
69	14.00	1	2025-10-25	12:08:32	1
70	15.50	1	2025-10-25	13:06:39	1
71	15.20	1	2025-10-25	14:06:06	1
72	16.70	1	2025-10-25	14:36:58	1
73	15.20	1	2025-10-25	15:20:50	1
74	14.00	1	2025-10-25	15:54:21	1
75	13.70	1	2025-10-25	16:05:55	1
\.


--
-- Data for Name: senzori; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.senzori (id, naziv, vrsta_mjerenja, lokacija_id) FROM stdin;
1	Sonoff TH Elite 1	temperatura	1
\.


--
-- Name: lokacije_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.lokacije_id_seq', 1, true);


--
-- Name: mjerenja_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.mjerenja_id_seq', 75, true);


--
-- Name: senzori_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.senzori_id_seq', 1, true);


--
-- Name: lokacije lokacije_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.lokacije
    ADD CONSTRAINT lokacije_pkey PRIMARY KEY (id);


--
-- Name: mjerenja mjerenja_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.mjerenja
    ADD CONSTRAINT mjerenja_pkey PRIMARY KEY (id);


--
-- Name: senzori senzori_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.senzori
    ADD CONSTRAINT senzori_pkey PRIMARY KEY (id);


--
-- Name: mjerenja mjerenja_lokacija_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.mjerenja
    ADD CONSTRAINT mjerenja_lokacija_id_fkey FOREIGN KEY (lokacija_id) REFERENCES public.lokacije(id);


--
-- Name: mjerenja mjerenja_senzor_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.mjerenja
    ADD CONSTRAINT mjerenja_senzor_id_fkey FOREIGN KEY (senzor_id) REFERENCES public.senzori(id);


--
-- Name: senzori senzori_lokacija_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.senzori
    ADD CONSTRAINT senzori_lokacija_id_fkey FOREIGN KEY (lokacija_id) REFERENCES public.lokacije(id);


--
-- PostgreSQL database dump complete
--

