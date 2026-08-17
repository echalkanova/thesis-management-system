--
-- PostgreSQL database dump
--

\restrict 4MWL9K6P5HMo30qIA3c5c3vMWXwKU4oFVxc13Ghh8H6Qh3S7X28cUrqgazeJ4VP

-- Dumped from database version 16.14 (Ubuntu 16.14-0ubuntu0.24.04.1)
-- Dumped by pg_dump version 16.14 (Ubuntu 16.14-0ubuntu0.24.04.1)

SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
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
-- Name: audit_log; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.audit_log (
    id integer NOT NULL,
    user_id integer,
    action text NOT NULL,
    entity_type text NOT NULL,
    entity_id integer,
    details jsonb,
    created_at timestamp with time zone DEFAULT now() NOT NULL
);


ALTER TABLE public.audit_log OWNER TO postgres;

--
-- Name: audit_log_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.audit_log_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.audit_log_id_seq OWNER TO postgres;

--
-- Name: audit_log_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.audit_log_id_seq OWNED BY public.audit_log.id;


--
-- Name: committee_members; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.committee_members (
    id integer NOT NULL,
    committee_id integer NOT NULL,
    user_id integer NOT NULL,
    is_chairman boolean DEFAULT false NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL
);


ALTER TABLE public.committee_members OWNER TO postgres;

--
-- Name: committee_members_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.committee_members_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.committee_members_id_seq OWNER TO postgres;

--
-- Name: committee_members_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.committee_members_id_seq OWNED BY public.committee_members.id;


--
-- Name: committees; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.committees (
    id integer NOT NULL,
    roman_numeral text NOT NULL,
    description text,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL
);


ALTER TABLE public.committees OWNER TO postgres;

--
-- Name: committees_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.committees_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.committees_id_seq OWNER TO postgres;

--
-- Name: committees_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.committees_id_seq OWNED BY public.committees.id;


--
-- Name: defense_grades; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.defense_grades (
    id integer NOT NULL,
    defense_id integer NOT NULL,
    student_id integer NOT NULL,
    grade numeric(4,2) NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL
);


ALTER TABLE public.defense_grades OWNER TO postgres;

--
-- Name: defense_grades_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.defense_grades_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.defense_grades_id_seq OWNER TO postgres;

--
-- Name: defense_grades_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.defense_grades_id_seq OWNED BY public.defense_grades.id;


--
-- Name: defense_students; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.defense_students (
    id integer NOT NULL,
    defense_id integer NOT NULL,
    student_id integer NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL
);


ALTER TABLE public.defense_students OWNER TO postgres;

--
-- Name: defense_students_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.defense_students_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.defense_students_id_seq OWNER TO postgres;

--
-- Name: defense_students_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.defense_students_id_seq OWNED BY public.defense_students.id;


--
-- Name: defenses; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.defenses (
    id integer NOT NULL,
    title text NOT NULL,
    scheduled_at timestamp with time zone NOT NULL,
    location text,
    room_or_link text,
    room text,
    start_time text,
    end_time text,
    committee_id integer,
    thesis_ids integer[] DEFAULT '{}'::integer[] NOT NULL,
    committee_ids integer[] DEFAULT '{}'::integer[] NOT NULL,
    notes text,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL
);


ALTER TABLE public.defenses OWNER TO postgres;

--
-- Name: defenses_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.defenses_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.defenses_id_seq OWNER TO postgres;

--
-- Name: defenses_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.defenses_id_seq OWNED BY public.defenses.id;


--
-- Name: grades; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.grades (
    id integer NOT NULL,
    thesis_id integer NOT NULL,
    grader_id integer NOT NULL,
    value real NOT NULL,
    comment text,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL
);


ALTER TABLE public.grades OWNER TO postgres;

--
-- Name: grades_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.grades_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.grades_id_seq OWNER TO postgres;

--
-- Name: grades_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.grades_id_seq OWNED BY public.grades.id;


--
-- Name: messages; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.messages (
    id integer NOT NULL,
    sender_id integer NOT NULL,
    receiver_id integer NOT NULL,
    content text NOT NULL,
    is_read boolean DEFAULT false NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL
);


ALTER TABLE public.messages OWNER TO postgres;

--
-- Name: messages_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.messages_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.messages_id_seq OWNER TO postgres;

--
-- Name: messages_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.messages_id_seq OWNED BY public.messages.id;


--
-- Name: notifications; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.notifications (
    id integer NOT NULL,
    user_id integer NOT NULL,
    title text NOT NULL,
    message text NOT NULL,
    type text DEFAULT 'info'::text NOT NULL,
    is_read boolean DEFAULT false NOT NULL,
    related_thesis_id integer,
    created_at timestamp with time zone DEFAULT now() NOT NULL
);


ALTER TABLE public.notifications OWNER TO postgres;

--
-- Name: notifications_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.notifications_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.notifications_id_seq OWNER TO postgres;

--
-- Name: notifications_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.notifications_id_seq OWNED BY public.notifications.id;


--
-- Name: reviews; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.reviews (
    id integer NOT NULL,
    thesis_id integer NOT NULL,
    reviewer_id integer NOT NULL,
    content text NOT NULL,
    file_url text,
    recommendation text NOT NULL,
    is_published boolean DEFAULT false NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL
);


ALTER TABLE public.reviews OWNER TO postgres;

--
-- Name: reviews_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.reviews_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.reviews_id_seq OWNER TO postgres;

--
-- Name: reviews_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.reviews_id_seq OWNED BY public.reviews.id;


--
-- Name: student_committees; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.student_committees (
    id integer NOT NULL,
    student_id integer NOT NULL,
    committee_id integer NOT NULL,
    assigned_at timestamp with time zone DEFAULT now() NOT NULL
);


ALTER TABLE public.student_committees OWNER TO postgres;

--
-- Name: student_committees_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.student_committees_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.student_committees_id_seq OWNER TO postgres;

--
-- Name: student_committees_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.student_committees_id_seq OWNED BY public.student_committees.id;


--
-- Name: supervisor_requests; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.supervisor_requests (
    id integer NOT NULL,
    student_id integer NOT NULL,
    supervisor_id integer NOT NULL,
    thesis_title text NOT NULL,
    technologies text NOT NULL,
    description text NOT NULL,
    status text DEFAULT 'pending'::text NOT NULL,
    reviewer_id integer,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL
);


ALTER TABLE public.supervisor_requests OWNER TO postgres;

--
-- Name: supervisor_requests_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.supervisor_requests_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.supervisor_requests_id_seq OWNER TO postgres;

--
-- Name: supervisor_requests_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.supervisor_requests_id_seq OWNED BY public.supervisor_requests.id;


--
-- Name: theses; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.theses (
    id integer NOT NULL,
    title text NOT NULL,
    description text,
    status text DEFAULT 'draft'::text NOT NULL,
    student_id integer NOT NULL,
    supervisor_id integer,
    reviewer_id integer,
    reviewer_selected_at timestamp with time zone,
    defense_id integer,
    keywords text,
    field text,
    submitted_at timestamp with time zone,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL,
    final_grade real,
    grade_calculated_at timestamp with time zone
);


ALTER TABLE public.theses OWNER TO postgres;

--
-- Name: theses_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.theses_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.theses_id_seq OWNER TO postgres;

--
-- Name: theses_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.theses_id_seq OWNED BY public.theses.id;


--
-- Name: thesis_files; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.thesis_files (
    id integer NOT NULL,
    thesis_id integer NOT NULL,
    file_name text NOT NULL,
    file_url text NOT NULL,
    file_type text NOT NULL,
    file_size integer NOT NULL,
    uploaded_by integer NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL
);


ALTER TABLE public.thesis_files OWNER TO postgres;

--
-- Name: thesis_files_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.thesis_files_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.thesis_files_id_seq OWNER TO postgres;

--
-- Name: thesis_files_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.thesis_files_id_seq OWNED BY public.thesis_files.id;


--
-- Name: users; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.users (
    id integer NOT NULL,
    email text NOT NULL,
    password_hash text NOT NULL,
    first_name text NOT NULL,
    last_name text NOT NULL,
    role text DEFAULT 'student'::text NOT NULL,
    faculty text,
    department text,
    phone_number text,
    avatar_url text,
    faculty_number text,
    subject_taught text,
    max_students integer DEFAULT 10,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL,
    specialty text,
    degree text,
    reset_token text,
    reset_token_expiry timestamp with time zone
);


ALTER TABLE public.users OWNER TO postgres;

--
-- Name: users_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.users_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.users_id_seq OWNER TO postgres;

--
-- Name: users_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.users_id_seq OWNED BY public.users.id;


--
-- Name: audit_log id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.audit_log ALTER COLUMN id SET DEFAULT nextval('public.audit_log_id_seq'::regclass);


--
-- Name: committee_members id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.committee_members ALTER COLUMN id SET DEFAULT nextval('public.committee_members_id_seq'::regclass);


--
-- Name: committees id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.committees ALTER COLUMN id SET DEFAULT nextval('public.committees_id_seq'::regclass);


--
-- Name: defense_grades id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.defense_grades ALTER COLUMN id SET DEFAULT nextval('public.defense_grades_id_seq'::regclass);


--
-- Name: defense_students id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.defense_students ALTER COLUMN id SET DEFAULT nextval('public.defense_students_id_seq'::regclass);


--
-- Name: defenses id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.defenses ALTER COLUMN id SET DEFAULT nextval('public.defenses_id_seq'::regclass);


--
-- Name: grades id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.grades ALTER COLUMN id SET DEFAULT nextval('public.grades_id_seq'::regclass);


--
-- Name: messages id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.messages ALTER COLUMN id SET DEFAULT nextval('public.messages_id_seq'::regclass);


--
-- Name: notifications id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.notifications ALTER COLUMN id SET DEFAULT nextval('public.notifications_id_seq'::regclass);


--
-- Name: reviews id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.reviews ALTER COLUMN id SET DEFAULT nextval('public.reviews_id_seq'::regclass);


--
-- Name: student_committees id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.student_committees ALTER COLUMN id SET DEFAULT nextval('public.student_committees_id_seq'::regclass);


--
-- Name: supervisor_requests id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.supervisor_requests ALTER COLUMN id SET DEFAULT nextval('public.supervisor_requests_id_seq'::regclass);


--
-- Name: theses id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.theses ALTER COLUMN id SET DEFAULT nextval('public.theses_id_seq'::regclass);


--
-- Name: thesis_files id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.thesis_files ALTER COLUMN id SET DEFAULT nextval('public.thesis_files_id_seq'::regclass);


--
-- Name: users id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.users ALTER COLUMN id SET DEFAULT nextval('public.users_id_seq'::regclass);


--
-- Data for Name: audit_log; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.audit_log (id, user_id, action, entity_type, entity_id, details, created_at) FROM stdin;
1	5	login	user	5	{"role": "reviewer", "email": "masenova@mail.bg"}	2026-08-11 16:52:16.922654+00
2	4	login	user	4	{"role": "admin", "email": "iangelov@abv.bg"}	2026-08-11 16:52:27.205033+00
3	6	login	user	6	{"role": "supervisor", "email": "givanov@uni.bg"}	2026-08-11 19:09:01.238387+00
4	2	login	user	2	{"role": "department_head", "email": "iivanova@abv.bg"}	2026-08-11 19:09:25.08284+00
5	4	login	user	4	{"role": "admin", "email": "iangelov@abv.bg"}	2026-08-11 19:11:28.112025+00
6	1	login	user	1	{"role": "student", "email": "kgeorgieva@uni.bg"}	2026-08-11 19:12:20.381791+00
7	4	login	user	4	{"role": "admin", "email": "iangelov@abv.bg"}	2026-08-11 19:26:38.465511+00
8	5	login	user	5	{"role": "reviewer", "email": "masenova@mail.bg"}	2026-08-11 19:31:15.226526+00
9	6	login	user	6	{"role": "supervisor", "email": "givanov@uni.bg"}	2026-08-11 20:37:00.376136+00
10	5	login	user	5	{"role": "reviewer", "email": "masenova@mail.bg"}	2026-08-11 20:41:02.832837+00
11	5	login	user	5	{"role": "reviewer", "email": "masenova@mail.bg"}	2026-08-12 10:48:44.265469+00
12	4	login	user	4	{"role": "admin", "email": "iangelov@abv.bg"}	2026-08-12 10:49:19.865983+00
13	5	login	user	5	{"role": "reviewer", "email": "masenova@mail.bg"}	2026-08-12 10:52:40.742238+00
14	6	login	user	6	{"role": "supervisor", "email": "givanov@uni.bg"}	2026-08-12 10:57:17.160037+00
15	4	login	user	4	{"role": "admin", "email": "iangelov@abv.bg"}	2026-08-12 10:57:32.80809+00
16	5	login	user	5	{"role": "reviewer", "email": "masenova@mail.bg"}	2026-08-12 11:34:56.794061+00
17	2	login	user	2	{"role": "department_head", "email": "iivanova@abv.bg"}	2026-08-12 12:18:25.772443+00
18	2	login	user	2	{"role": "department_head", "email": "iivanova@abv.bg"}	2026-08-12 12:24:16.811279+00
19	1	login	user	1	{"role": "student", "email": "kgeorgieva@uni.bg"}	2026-08-12 12:32:53.305179+00
20	1	create_thesis	thesis	1	{"title": "Автоматизация на болничния процес"}	2026-08-12 15:01:27.720117+00
21	6	login	user	6	{"role": "supervisor", "email": "givanov@uni.bg"}	2026-08-12 15:42:22.344229+00
22	1	submit_thesis	thesis	1	{"title": "Автоматизация на болничния процес"}	2026-08-12 16:10:59.906128+00
23	6	login	user	6	{"role": "supervisor", "email": "givanov@uni.bg"}	2026-08-12 16:11:27.310111+00
24	6	login	user	6	{"role": "supervisor", "email": "givanov@uni.bg"}	2026-08-12 16:22:59.468155+00
25	6	approve_thesis	thesis	1	{"title": "Автоматизация на болничния процес"}	2026-08-12 16:30:04.015122+00
26	5	login	user	5	{"role": "reviewer", "email": "masenova@mail.bg"}	2026-08-12 16:48:55.831854+00
27	6	login	user	6	{"role": "supervisor", "email": "givanov@uni.bg"}	2026-08-12 16:52:10.789932+00
28	7	create_thesis	thesis	2	{"title": "Сайт за автомоболи"}	2026-08-12 18:37:37.438268+00
29	6	login	user	6	{"role": "supervisor", "email": "givanov@uni.bg"}	2026-08-12 18:41:55.962491+00
30	7	submit_thesis	thesis	2	{"title": "Сайт за автомоболи"}	2026-08-12 18:43:28.271206+00
31	6	approve_thesis	thesis	2	{"title": "Сайт за автомоболи"}	2026-08-12 18:48:43.24529+00
32	5	login	user	5	{"role": "reviewer", "email": "masenova@mail.bg"}	2026-08-12 18:59:30.96964+00
33	5	publish_review	review	1	{"thesisId": 2, "recommendation": "approve"}	2026-08-12 19:07:53.422541+00
34	2	login	user	2	{"role": "department_head", "email": "iivanova@abv.bg"}	2026-08-12 20:41:52.72273+00
35	7	login	user	7	{"role": "student", "email": "itodorov@uni.bg"}	2026-08-13 11:46:30.407138+00
36	1	login	user	1	{"role": "student", "email": "kgeorgieva@uni.bg"}	2026-08-13 12:08:36.530363+00
37	8	login	user	8	{"role": "student", "email": "mstefanova@uni.bg"}	2026-08-13 12:13:23.491442+00
38	7	login	user	7	{"role": "student", "email": "itodorov@uni.bg"}	2026-08-13 12:37:01.017137+00
39	4	login	user	4	{"role": "admin", "email": "iangelov@uni.bg"}	2026-08-13 16:11:02.12329+00
40	4	login	user	4	{"role": "admin", "email": "iangelov@uni.bg"}	2026-08-13 16:30:26.775246+00
41	2	login	user	2	{"role": "department_head", "email": "iivanova@uni.bg"}	2026-08-13 18:43:45.802193+00
42	7	login	user	7	{"role": "student", "email": "itodorov@uni.bg"}	2026-08-13 18:45:38.724875+00
43	4	login	user	4	{"role": "admin", "email": "iangelov@uni.bg"}	2026-08-13 19:15:27.332747+00
44	4	create_user	user	10	{"name": "Живко Данчев", "role": "supervisor", "email": "jdanchev@uni.bg"}	2026-08-13 19:20:00.393784+00
45	4	create_user	user	11	{"name": "Тодор Божилов", "role": "supervisor", "email": "tbozhilov@uni.bg"}	2026-08-13 19:21:00.672042+00
46	7	login	user	7	{"role": "student", "email": "itodorov@uni.bg"}	2026-08-13 19:21:24.110945+00
47	7	login	user	7	{"role": "student", "email": "itodorov@uni.bg"}	2026-08-13 19:46:05.295879+00
48	4	login	user	4	{"role": "admin", "email": "iangelov@uni.bg"}	2026-08-13 20:03:14.716869+00
49	4	create_user	user	12	{"name": "Николай Цанев", "role": "supervisor", "email": "ntsanev@uni.bg"}	2026-08-13 20:04:14.077347+00
50	7	login	user	7	{"role": "student", "email": "itodorov@uni.bg"}	2026-08-13 20:05:24.250329+00
51	7	login	user	7	{"role": "student", "email": "itodorov@uni.bg"}	2026-08-13 20:21:41.068195+00
52	2	login	user	2	{"role": "department_head", "email": "iivanova@uni.bg"}	2026-08-13 20:22:03.209018+00
53	6	login	user	6	{"role": "supervisor", "email": "givanov@uni.bg"}	2026-08-14 11:30:21.149374+00
54	4	login	user	4	{"role": "admin", "email": "iangelov@uni.bg"}	2026-08-14 12:10:26.768048+00
55	4	update_user	user	7	{"name": "Иван Тодоров"}	2026-08-14 12:11:17.037869+00
56	2	login	user	2	{"role": "department_head", "email": "iivanova@uni.bg"}	2026-08-14 14:24:29.708351+00
57	8	login	user	8	{"role": "student", "email": "mstefanova@uni.bg"}	2026-08-14 14:26:23.913848+00
58	5	login	user	5	{"role": "reviewer", "email": "masenova@uni.bg"}	2026-08-14 14:39:22.018354+00
59	5	login	user	5	{"role": "reviewer", "email": "masenova@uni.bg"}	2026-08-14 15:53:00.071268+00
60	2	login	user	2	{"role": "department_head", "email": "iivanova@uni.bg"}	2026-08-14 15:53:41.703865+00
61	5	login	user	5	{"role": "reviewer", "email": "masenova@uni.bg"}	2026-08-14 16:07:24.668707+00
62	4	update_user	user	7	{"name": "Иван Тодоров"}	2026-08-14 16:32:33.071401+00
63	6	login	user	6	{"role": "supervisor", "email": "givanov@uni.bg"}	2026-08-14 16:35:37.683762+00
64	7	login	user	7	{"role": "student", "email": "itodorov@uni.bg"}	2026-08-14 16:36:16.930537+00
65	4	update_user	user	7	{"name": "Иван Тодоров"}	2026-08-14 16:50:48.742345+00
66	4	update_user	user	1	{"name": "Катя Георгиева"}	2026-08-14 16:55:25.479337+00
67	7	login	user	7	{"role": "student", "email": "itodorov@uni.bg"}	2026-08-14 18:25:36.468841+00
68	6	login	user	6	{"role": "supervisor", "email": "givanov@uni.bg"}	2026-08-14 18:44:30.651709+00
69	5	login	user	5	{"role": "reviewer", "email": "masenova@uni.bg"}	2026-08-14 18:57:41.006628+00
70	12	login	user	12	{"role": "supervisor", "email": "ntsanev@uni.bg"}	2026-08-14 18:58:38.448646+00
71	4	login	user	4	{"role": "admin", "email": "iangelov@uni.bg"}	2026-08-14 19:07:38.309285+00
72	7	login	user	7	{"role": "student", "email": "itodorov@uni.bg"}	2026-08-14 19:12:20.499188+00
73	12	login	user	12	{"role": "supervisor", "email": "ntsanev@uni.bg"}	2026-08-14 19:12:40.510636+00
74	5	login	user	5	{"role": "reviewer", "email": "masenova@uni.bg"}	2026-08-14 19:57:47.069553+00
75	9	login	user	9	{"role": "supervisor", "email": "syordanov@uni.bg"}	2026-08-14 20:01:02.891679+00
76	7	login	user	7	{"role": "student", "email": "itodorov@uni.bg"}	2026-08-14 20:05:35.487528+00
77	12	login	user	12	{"role": "supervisor", "email": "ntsanev@uni.bg"}	2026-08-14 20:18:49.699005+00
78	12	login	user	12	{"role": "supervisor", "email": "ntsanev@uni.bg"}	2026-08-14 21:02:00.778189+00
79	6	login	user	6	{"role": "supervisor", "email": "givanov@uni.bg"}	2026-08-16 14:50:37.275768+00
80	2	login	user	2	{"role": "department_head", "email": "iivanova@uni.bg"}	2026-08-16 15:07:03.355206+00
81	4	login	user	4	{"role": "admin", "email": "iangelov@uni.bg"}	2026-08-16 15:30:18.896422+00
82	5	login	user	5	{"role": "reviewer", "email": "masenova@uni.bg"}	2026-08-16 15:32:11.190858+00
83	2	login	user	2	{"role": "department_head", "email": "iivanova@uni.bg"}	2026-08-16 16:05:03.72865+00
84	4	login	user	4	{"role": "admin", "email": "iangelov@uni.bg"}	2026-08-16 16:26:58.297257+00
85	4	update_user	user	11	{"name": "Тодор Божилов"}	2026-08-16 16:29:06.222096+00
86	11	login	user	11	{"role": "supervisor", "email": "tbozhilov@uni.bg"}	2026-08-16 16:29:56.651767+00
87	4	update_user	user	11	{"name": "Тодор Божилов"}	2026-08-16 16:34:29.157522+00
88	11	login	user	11	{"role": "supervisor", "email": "tbozhilov@uni.bg"}	2026-08-16 16:34:51.00471+00
89	4	update_user	user	11	{"name": "Тодор Божилов"}	2026-08-16 16:35:46.108337+00
90	4	update_user	user	11	{"name": "Тодор Божилов"}	2026-08-16 16:36:18.481548+00
91	4	update_user	user	11	{"name": "Тодор Божилов"}	2026-08-16 16:39:08.280913+00
92	4	update_user	user	11	{"name": "Тодор Божилов"}	2026-08-16 16:39:39.629338+00
93	4	update_user	user	11	{"name": "Тодор Божилов"}	2026-08-16 16:41:25.835072+00
94	11	login	user	11	{"role": "supervisor", "email": "tbozhilov@uni.bg"}	2026-08-16 16:41:40.477542+00
95	4	update_user	user	11	{"name": "Тодор Божилов"}	2026-08-16 16:42:04.912137+00
96	11	login	user	11	{"role": "supervisor", "email": "tbozhilov@uni.bg"}	2026-08-16 16:42:08.896288+00
97	2	login	user	2	{"role": "department_head", "email": "iivanova@uni.bg"}	2026-08-16 17:17:57.828903+00
98	2	login	user	2	{"role": "department_head", "email": "iivanova@uni.bg"}	2026-08-16 20:32:49.063928+00
99	7	login	user	7	{"role": "student", "email": "itodorov@uni.bg"}	2026-08-16 20:51:07.727866+00
100	4	login	user	4	{"role": "admin", "email": "iangelov@uni.bg"}	2026-08-16 20:55:47.674689+00
101	4	update_user	user	7	{"name": "Иван Тодоров"}	2026-08-16 20:55:58.820973+00
102	4	update_user	user	7	{"name": "Иван Тодоров"}	2026-08-16 20:56:02.484351+00
103	2	login	user	2	{"role": "department_head", "email": "iivanova@uni.bg"}	2026-08-16 21:21:26.548318+00
104	4	update_user	user	5	{"name": "Мария Асенова"}	2026-08-16 21:47:15.142963+00
105	4	update_user	user	4	{"name": "Ivo Angelov"}	2026-08-17 10:22:49.842027+00
106	6	login	user	6	{"role": "supervisor", "email": "givanov@uni.bg"}	2026-08-17 10:27:11.881027+00
107	2	login	user	2	{"role": "department_head", "email": "iivanova@uni.bg"}	2026-08-17 10:44:06.140957+00
108	4	login	user	4	{"role": "admin", "email": "iangelov@uni.bg"}	2026-08-17 10:48:24.419033+00
109	7	login	user	7	{"role": "student", "email": "itodorov@uni.bg"}	2026-08-17 10:50:53.292095+00
110	6	login	user	6	{"role": "supervisor", "email": "givanov@uni.bg"}	2026-08-17 11:00:10.001305+00
111	7	login	user	7	{"role": "student", "email": "itodorov@uni.bg"}	2026-08-17 11:12:46.789095+00
112	12	login	user	12	{"role": "supervisor", "email": "ntsanev@uni.bg"}	2026-08-17 11:13:03.247921+00
113	12	create_grade	defense	1	{"grade": 6, "studentId": 7}	2026-08-17 11:13:10.380938+00
114	12	create_grade	defense	1	{"grade": 6, "studentId": 7}	2026-08-17 11:20:05.129641+00
115	7	login	user	7	{"role": "student", "email": "itodorov@uni.bg"}	2026-08-17 11:24:27.272664+00
116	12	create_grade	defense	1	{"grade": 6, "studentId": 7}	2026-08-17 11:28:29.950348+00
117	12	create_grade	defense	1	{"grade": 5.75, "studentId": 7}	2026-08-17 11:33:14.569455+00
118	6	login	user	6	{"role": "supervisor", "email": "givanov@uni.bg"}	2026-08-17 11:43:42.804073+00
119	7	login	user	7	{"role": "student", "email": "itodorov@uni.bg"}	2026-08-17 11:54:00.056798+00
120	1	login	user	1	{"role": "student", "email": "kgeorgieva@uni.bg"}	2026-08-17 11:55:41.024299+00
121	4	login	user	4	{"role": "admin", "email": "iangelov@uni.bg"}	2026-08-17 11:56:11.62339+00
122	8	login	user	8	{"role": "student", "email": "mstefanova@uni.bg"}	2026-08-17 11:56:38.283216+00
123	7	login	user	7	{"role": "student", "email": "itodorov@uni.bg"}	2026-08-17 11:57:00.99065+00
124	5	login	user	5	{"role": "supervisor", "email": "masenova@uni.bg"}	2026-08-17 11:59:39.967626+00
125	4	login	user	4	{"role": "admin", "email": "iangelov@uni.bg"}	2026-08-17 12:00:05.327711+00
126	2	login	user	2	{"role": "department_head", "email": "iivanova@uni.bg"}	2026-08-17 12:02:49.435136+00
127	6	login	user	6	{"role": "supervisor", "email": "givanov@uni.bg"}	2026-08-17 12:05:12.441927+00
128	4	login	user	4	{"role": "admin", "email": "iangelov@uni.bg"}	2026-08-17 12:19:31.939764+00
129	7	login	user	7	{"role": "student", "email": "itodorov@uni.bg"}	2026-08-17 12:22:01.346317+00
130	2	login	user	2	{"role": "department_head", "email": "iivanova@uni.bg"}	2026-08-17 12:23:36.983422+00
131	5	login	user	5	{"role": "supervisor", "email": "masenova@uni.bg"}	2026-08-17 12:25:08.514089+00
132	7	login	user	7	{"role": "student", "email": "itodorov@uni.bg"}	2026-08-17 12:25:39.349797+00
133	2	login	user	2	{"role": "department_head", "email": "iivanova@uni.bg"}	2026-08-17 12:31:17.901005+00
134	7	login	user	7	{"role": "student", "email": "itodorov@uni.bg"}	2026-08-17 14:08:30.04082+00
135	5	login	user	5	{"role": "supervisor", "email": "masenova@uni.bg"}	2026-08-17 14:08:50.5689+00
136	4	login	user	4	{"role": "admin", "email": "iangelov@uni.bg"}	2026-08-17 14:45:26.502469+00
137	6	login	user	6	{"role": "supervisor", "email": "givanov@uni.bg"}	2026-08-17 14:54:18.13924+00
\.


--
-- Data for Name: committee_members; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.committee_members (id, committee_id, user_id, is_chairman, created_at) FROM stdin;
3	3	9	f	2026-08-13 19:22:25.507741+00
4	3	10	f	2026-08-13 19:22:25.574475+00
5	3	11	f	2026-08-13 19:22:25.635494+00
7	3	6	f	2026-08-13 19:40:57.98446+00
8	3	5	t	2026-08-13 20:02:16.337024+00
39	9	2	f	2026-08-13 20:36:20.238499+00
40	9	9	f	2026-08-13 20:36:20.300136+00
41	9	10	f	2026-08-13 20:36:20.368185+00
42	9	11	f	2026-08-13 20:36:20.433439+00
44	9	12	t	2026-08-13 20:36:26.11396+00
\.


--
-- Data for Name: committees; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.committees (id, roman_numeral, description, created_at, updated_at) FROM stdin;
3	I	\N	2026-08-13 19:21:40.605619+00	2026-08-13 19:21:40.605619+00
9	II	\N	2026-08-13 20:36:09.831362+00	2026-08-13 20:36:09.831362+00
\.


--
-- Data for Name: defense_grades; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.defense_grades (id, defense_id, student_id, grade, created_at, updated_at) FROM stdin;
14	1	7	5.75	2026-08-17 11:33:14.566777+00	2026-08-17 11:33:14.566777+00
\.


--
-- Data for Name: defense_students; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.defense_students (id, defense_id, student_id, created_at) FROM stdin;
\.


--
-- Data for Name: defenses; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.defenses (id, title, scheduled_at, location, room_or_link, room, start_time, end_time, committee_id, thesis_ids, committee_ids, notes, created_at, updated_at) FROM stdin;
2	Защита 2	2026-08-18 00:00:00+00	\N	710	710	08:30		3	{}	{3}		2026-08-13 20:47:10.627672+00	2026-08-13 20:47:10.627672+00
1	Защита 1	2026-08-14 08:30:00+00	\N	2103	2103	08:30		9	{7}	{9}		2026-08-13 20:45:51.410387+00	2026-08-13 21:31:00.017+00
\.


--
-- Data for Name: grades; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.grades (id, thesis_id, grader_id, value, comment, created_at, updated_at) FROM stdin;
\.


--
-- Data for Name: messages; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.messages (id, sender_id, receiver_id, content, is_read, created_at) FROM stdin;
1	4	5	Здравейте!	t	2026-08-14 14:44:55.380128+00
2	4	5	📎 [kms-lab2-2025 (1).pdf](/uploads/1786719147901-328355700.pdf)	t	2026-08-14 14:52:28.223434+00
3	5	4	📎 [СМО_Доклад_Вариант20.docx](/uploads/1786719171450-326298022.docx)	t	2026-08-14 14:52:51.61845+00
4	4	5	.\n📎 [kms-lab2-2025 (1).pdf](/uploads/kms-lab2-2025 (1).pdf)	t	2026-08-14 14:59:06.505876+00
5	4	5	доклад\n📎 [СМО_Доклад_Вариант20.docx](/uploads/1786719686314-988420972.docx)	t	2026-08-14 15:01:26.494884+00
6	5	4	проба	t	2026-08-17 11:59:50.168525+00
7	4	5	proba	t	2026-08-17 12:00:20.134598+00
\.


--
-- Data for Name: notifications; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.notifications (id, user_id, title, message, type, is_read, related_thesis_id, created_at) FROM stdin;
1	6	Ново запитване за ръководство	Студент иска да бъдете негов ръководител за: "Автоматизация на болничния процес"	info	t	\N	2026-08-12 15:40:30.22481+00
2	1	Запитването е одобрено!	Вашето запитване за ръководство на "Автоматизация на болничния процес" е одобрено!	success	t	\N	2026-08-12 15:50:33.391142+00
14	8	Запитването е одобрено!	Вашето запитване за ръководство на "Дронове" е одобрено!	success	t	\N	2026-08-12 20:55:49.288639+00
26	11	Добавени сте към комисия	Добавени сте като член на Комисия II	info	f	\N	2026-08-13 20:04:35.797671+00
4	1	Дипломната работа е одобрена	Научният ръководител одобри "Автоматизация на болничния процес"	success	t	1	2026-08-12 16:30:04.016657+00
34	11	Добавени сте към комисия	Добавени сте като член на Комисия II	info	f	\N	2026-08-13 20:18:15.581208+00
35	10	Добавени сте към комисия	Добавени сте като член на Комисия II	info	f	\N	2026-08-13 20:18:15.652813+00
19	10	Добавени сте към комисия	Добавени сте като член на Комисия I	info	f	\N	2026-08-13 19:22:25.576093+00
20	11	Добавени сте към комисия	Добавени сте като член на Комисия I	info	f	\N	2026-08-13 19:22:25.637365+00
27	10	Добавени сте към комисия	Добавени сте като член на Комисия II	info	f	\N	2026-08-13 20:04:35.870799+00
30	10	Добавени сте към комисия	Добавени сте като председател на Комисия II	info	f	\N	2026-08-13 20:04:42.298581+00
36	9	Добавени сте към комисия	Добавени сте като член на Комисия II	info	t	\N	2026-08-13 20:18:15.720056+00
37	2	Добавени сте към комисия	Добавени сте като член на Комисия II	info	t	\N	2026-08-13 20:18:15.796869+00
13	2	Ново запитване за ръководство	Студент иска да бъдете негов ръководител за: "Дронове"	info	t	\N	2026-08-12 20:36:45.663281+00
29	2	Добавени сте към комисия	Добавени сте като член на Комисия II	info	t	\N	2026-08-13 20:04:36.169118+00
18	9	Добавени сте към комисия	Добавени сте като член на Комисия I	info	t	\N	2026-08-13 19:22:25.509301+00
28	9	Добавени сте към комисия	Добавени сте като член на Комисия II	info	t	\N	2026-08-13 20:04:36.015116+00
9	5	Назначени сте за рецензент	Назначени сте за рецензент на "Сайт за автомоболи"	info	t	2	2026-08-12 18:48:43.337765+00
24	5	Добавени сте към комисия	Добавени сте като председател на Комисия I	info	t	\N	2026-08-13 20:02:16.3392+00
17	5	Добавени сте към комисия	Добавени сте като член на Комисия I	info	t	\N	2026-08-13 19:22:25.441002+00
38	9	Добавени сте към комисия	Добавени сте като председател на Комисия II	info	t	\N	2026-08-13 20:18:20.039665+00
3	6	Нова подадена дипломна работа	Студент е подал дипломна работа: "Автоматизация на болничния процес"	info	t	1	2026-08-12 16:10:59.907753+00
5	6	Ново запитване за ръководство	Студент иска да бъдете негов ръководител за: "Сайт за автомобили"	info	t	\N	2026-08-12 18:41:04.119767+00
22	6	Добавени сте към комисия	Добавени сте като член на Комисия I	info	t	\N	2026-08-13 19:24:45.00813+00
7	6	Нова подадена дипломна работа	Студент е подал дипломна работа: "Сайт за автомоболи"	info	t	2	2026-08-12 18:43:28.27276+00
12	6	Рецензията е изготвена	Рецензията на "Сайт за автомоболи" е готова.	info	t	2	2026-08-12 19:07:53.420523+00
23	6	Добавени сте към комисия	Добавени сте като председател на Комисия I	info	t	\N	2026-08-13 19:40:57.986853+00
25	12	Добавени сте към комисия	Добавени сте като член на Комисия II	info	t	\N	2026-08-13 20:04:35.588701+00
33	12	Добавени сте към комисия	Добавени сте като член на Комисия II	info	t	\N	2026-08-13 20:18:15.506345+00
32	7	Премахнати сте от комисия	Комисия II е изтрита и вие сте премахнати от нея.	warning	t	\N	2026-08-13 20:17:59.151916+00
6	7	Запитването е одобрено!	Вашето запитване за ръководство на "Сайт за автомобили" е одобрено!	success	t	\N	2026-08-12 18:42:13.077663+00
8	7	Дипломната работа е одобрена	Научният ръководител одобри "Сайт за автомоболи"	success	t	2	2026-08-12 18:48:43.246586+00
10	7	Дипломната работа е изпратена за рецензия	"Сайт за автомоболи" е изпратена за рецензия	info	t	2	2026-08-12 18:48:43.34135+00
42	11	Добавени сте към комисия	Добавени сте като член на Комисия II	info	f	\N	2026-08-13 20:22:24.758923+00
43	10	Добавени сте към комисия	Добавени сте като член на Комисия II	info	f	\N	2026-08-13 20:22:24.836438+00
45	2	Добавени сте към комисия	Добавени сте като член на Комисия II	info	t	\N	2026-08-13 20:22:25.067016+00
49	2	Добавени сте към комисия	Добавени сте като член на Комисия II	info	t	\N	2026-08-13 20:26:35.789132+00
57	2	Добавени сте към комисия	Добавени сте като член на Комисия II	info	t	\N	2026-08-13 20:29:52.377203+00
65	2	Добавени сте към комисия	Добавени сте като член на Комисия II	info	t	\N	2026-08-13 20:36:20.240553+00
64	7	Премахнати сте от комисия	Комисия II е изтрита и вие сте премахнати от нея.	warning	t	\N	2026-08-13 20:35:47.342543+00
15	7	Допуснати сте до защита!	"Сайт за автомоболи" е допусната до защита	success	t	2	2026-08-13 19:04:46.859246+00
11	7	Рецензията е готова	Вашата дипломна работа "Сайт за автомоболи" получи рецензия.	info	t	2	2026-08-12 19:07:53.418262+00
31	7	Назначени сте към комисия	Назначени сте към Комисия II	info	t	\N	2026-08-13 20:07:20.86151+00
39	7	Назначени сте към комисия	Назначени сте към Комисия II	info	t	\N	2026-08-13 20:18:42.390339+00
51	10	Добавени сте към комисия	Добавени сте като член на Комисия II	info	f	\N	2026-08-13 20:26:35.931801+00
53	11	Добавени сте към комисия	Добавени сте като член на Комисия II	info	f	\N	2026-08-13 20:26:36.061912+00
54	11	Добавени сте към комисия	Добавени сте като председател на Комисия II	info	f	\N	2026-08-13 20:26:41.178211+00
59	10	Добавени сте към комисия	Добавени сте като член на Комисия II	info	f	\N	2026-08-13 20:29:52.533642+00
60	11	Добавени сте към комисия	Добавени сте като член на Комисия II	info	f	\N	2026-08-13 20:29:52.602611+00
62	11	Добавени сте към комисия	Добавени сте като председател на Комисия II	info	f	\N	2026-08-13 20:29:55.665634+00
67	10	Добавени сте към комисия	Добавени сте като член на Комисия II	info	f	\N	2026-08-13 20:36:20.372641+00
68	11	Добавени сте към комисия	Добавени сте като член на Комисия II	info	f	\N	2026-08-13 20:36:20.434752+00
44	9	Добавени сте към комисия	Добавени сте като член на Комисия II	info	t	\N	2026-08-13 20:22:25.005234+00
46	9	Добавени сте към комисия	Добавени сте като председател на Комисия II	info	t	\N	2026-08-13 20:22:29.351331+00
50	9	Добавени сте към комисия	Добавени сте като член на Комисия II	info	t	\N	2026-08-13 20:26:35.866032+00
58	9	Добавени сте към комисия	Добавени сте като член на Комисия II	info	t	\N	2026-08-13 20:29:52.457949+00
66	9	Добавени сте към комисия	Добавени сте като член на Комисия II	info	t	\N	2026-08-13 20:36:20.303083+00
71	7	Назначени сте към комисия	Назначени сте към Комисия II	info	t	\N	2026-08-13 20:37:05.702409+00
72	7	Насрочена защита	Добавени сте към защита "Защита 1" на 16.08.2026 г. в зала 2103	info	t	\N	2026-08-13 21:09:22.709908+00
41	12	Добавени сте към комисия	Добавени сте като член на Комисия II	info	t	\N	2026-08-13 20:22:24.6804+00
52	12	Добавени сте към комисия	Добавени сте като член на Комисия II	info	t	\N	2026-08-13 20:26:35.996888+00
61	12	Добавени сте към комисия	Добавени сте като член на Комисия II	info	t	\N	2026-08-13 20:29:52.667672+00
69	12	Добавени сте към комисия	Добавени сте като член на Комисия II	info	t	\N	2026-08-13 20:36:20.497922+00
70	12	Добавени сте към комисия	Добавени сте като председател на Комисия II	info	t	\N	2026-08-13 20:36:26.11567+00
16	6	Добавени сте към комисия	Добавени сте като член на Комисия I	info	t	\N	2026-08-13 19:22:25.375062+00
21	6	Премахнати сте от комисия	Премахнати сте от Комисия I	warning	t	\N	2026-08-13 19:22:42.925153+00
47	7	Назначени сте към комисия	Назначени сте към Комисия II	info	t	\N	2026-08-13 20:24:39.959715+00
78	7	Нанесена оценка от защита	Вашата оценка от защитата е 5.75 (Отличен)	success	t	\N	2026-08-14 20:28:26.703998+00
79	7	Успешно защитена дипломна работа	Вашата дипломна работа е маркирана като успешно защитена.	success	t	\N	2026-08-14 20:36:44.29281+00
80	7	Нанесена оценка от защита	Вашата оценка от защитата е 5.75 (Отличен)	success	t	\N	2026-08-14 20:37:00.274938+00
81	7	Успешно защитена дипломна работа	Вашата дипломна работа е маркирана като успешно защитена.	success	t	\N	2026-08-14 20:40:30.162006+00
82	7	Нанесена оценка от защита	Вашата оценка от защитата е 5.75 (Отличен)	success	t	\N	2026-08-14 20:40:34.506385+00
83	7	Успешно защитена дипломна работа	Вашата дипломна работа е маркирана като успешно защитена.	success	t	\N	2026-08-14 20:44:32.775239+00
84	7	Нанесена оценка от защита	Вашата оценка от защитата е 5.75 (Отличен)	success	t	\N	2026-08-14 20:44:45.612271+00
85	7	Нанесена оценка от защита	Вашата оценка от защитата е 6.00 (Отличен)	success	t	\N	2026-08-14 20:46:40.229336+00
86	7	Нанесена оценка от защита	Вашата оценка от защитата е 5.75 (Отличен)	success	t	\N	2026-08-14 20:53:14.422391+00
87	7	Нанесена оценка от защита	Вашата оценка от защитата е 5.75 (Отличен)	success	t	\N	2026-08-14 20:55:27.740272+00
88	7	Успешно защитена дипломна работа	Вашата дипломна работа е маркирана като успешно защитена.	success	t	\N	2026-08-14 20:57:28.769705+00
89	7	Нанесена оценка от защита	Вашата оценка от защитата е 5.75 (Отличен)	success	t	\N	2026-08-14 20:57:46.313353+00
90	7	Успешно защитена дипломна работа	Вашата дипломна работа е маркирана като успешно защитена.	success	t	\N	2026-08-14 21:08:35.318367+00
91	7	Нанесена оценка от защита	Вашата оценка от защитата е 5.75 (Отличен)	success	t	\N	2026-08-14 21:08:43.584252+00
40	7	Премахнати сте от комисия	Комисия II е изтрита и вие сте премахнати от нея.	warning	t	\N	2026-08-13 20:22:09.536022+00
48	7	Премахнати сте от комисия	Комисия II е изтрита и вие сте премахнати от нея.	warning	t	\N	2026-08-13 20:26:20.76581+00
55	7	Назначени сте към комисия	Назначени сте към Комисия II	info	t	\N	2026-08-13 20:26:57.807283+00
56	7	Премахнати сте от комисия	Комисия II е изтрита и вие сте премахнати от нея.	warning	t	\N	2026-08-13 20:29:33.894434+00
63	7	Назначени сте към комисия	Назначени сте към Комисия II	info	t	\N	2026-08-13 20:31:09.722175+00
73	7	Насрочена защита	Добавени сте към защита "Защита 1" на 16.08.2026 г. в зала 2103	info	t	\N	2026-08-13 21:28:38.283455+00
74	7	Насрочена защита	Добавени сте към защита "Защита 1" на 16.08.2026 г. в зала 2103	info	t	\N	2026-08-13 21:31:00.018709+00
75	7	Успешно защитена дипломна работа	Вашата дипломна работа е маркирана като успешно защитена.	success	t	\N	2026-08-14 20:19:00.005126+00
76	7	Успешно защитена дипломна работа	Вашата дипломна работа е маркирана като успешно защитена.	success	t	\N	2026-08-14 20:19:04.380029+00
77	7	Успешно защитена дипломна работа	Вашата дипломна работа е маркирана като успешно защитена.	success	t	\N	2026-08-14 20:24:08.946761+00
92	7	Нанесена оценка от защита	Вашата оценка от защитата е 5.50 (Отличен)	success	t	\N	2026-08-14 21:11:59.517357+00
93	7	Успешно защитена дипломна работа	Вашата дипломна работа е маркирана като успешно защитена.	success	t	\N	2026-08-17 11:13:07.100427+00
94	7	Нанесена оценка от защита	Вашата оценка от защитата е 6.00 (Отличен)	success	t	\N	2026-08-17 11:13:10.379493+00
95	7	Нанесена оценка от защита	Вашата оценка от защитата е 6.00 (Отличен)	success	t	\N	2026-08-17 11:20:05.127996+00
96	7	Успешно защитена дипломна работа	Вашата дипломна работа е маркирана като успешно защитена.	success	t	\N	2026-08-17 11:28:28.80878+00
97	7	Нанесена оценка от защита	Вашата оценка от защитата е 6.00 (Отличен)	success	t	\N	2026-08-17 11:28:29.949058+00
98	7	Успешно защитена дипломна работа	Вашата дипломна работа е маркирана като успешно защитена.	success	t	\N	2026-08-17 11:33:12.320103+00
99	7	Нанесена оценка от защита	Вашата оценка от защитата е 5.75 (Отличен)	success	t	\N	2026-08-17 11:33:14.568067+00
\.


--
-- Data for Name: reviews; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.reviews (id, thesis_id, reviewer_id, content, file_url, recommendation, is_published, created_at, updated_at) FROM stdin;
1	2	5	Рецензия за автомобили.	/uploads/reviews/1786561673281-571313693.docx	approve	t	2026-08-12 19:07:53.414032+00	2026-08-12 19:07:53.414032+00
\.


--
-- Data for Name: student_committees; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.student_committees (id, student_id, committee_id, assigned_at) FROM stdin;
7	7	9	2026-08-13 20:37:05.699809+00
\.


--
-- Data for Name: supervisor_requests; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.supervisor_requests (id, student_id, supervisor_id, thesis_title, technologies, description, status, reviewer_id, created_at, updated_at) FROM stdin;
1	1	6	Автоматизация на болничния процес	React, Node.JS	Автоматизация на болничния процес	accepted	\N	2026-08-12 15:40:30.222973+00	2026-08-12 15:50:33.279+00
2	7	6	Сайт за автомобили	HTML, CSS	Сайт за автомобили	accepted	\N	2026-08-12 18:41:04.116316+00	2026-08-12 18:42:13.069+00
3	8	2	Дронове	C, Python	Дронове 	accepted	\N	2026-08-12 20:36:45.6615+00	2026-08-12 20:55:49.285+00
\.


--
-- Data for Name: theses; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.theses (id, title, description, status, student_id, supervisor_id, reviewer_id, reviewer_selected_at, defense_id, keywords, field, submitted_at, created_at, updated_at, final_grade, grade_calculated_at) FROM stdin;
1	Автоматизация на болничния процес	Автоматизация на болничния процес	approved_by_supervisor	1	6	\N	\N	\N	React, JS	Уеб технология	2026-08-12 16:10:59.903+00	2026-08-12 15:01:27.709063+00	2026-08-12 16:30:04.013+00	\N	\N
2	Сайт за автомоболи		graded	7	6	5	2026-08-12 18:48:43.331+00	\N	HTML, CSS	Уеб технологии	2026-08-12 18:43:28.269+00	2026-08-12 18:37:37.434093+00	2026-08-17 11:33:14.571+00	\N	\N
\.


--
-- Data for Name: thesis_files; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.thesis_files (id, thesis_id, file_name, file_url, file_type, file_size, uploaded_by, created_at) FROM stdin;
2	1	ÐÑÐ¸Ð¼ÐµÑÐ½Ð° ÑÑÑÑÐºÑÑÑÐ° - Ð¿ÑÐ¾ÐµÐºÑ ÐÐÐ.docx	/uploads/1786547316947-297039058.docx	application/vnd.openxmlformats-officedocument.wordprocessingml.document	106169	1	2026-08-12 15:08:36.96559+00
3	2	Примерна структура - проект НБД.docx	/uploads/1786559882632-824334793.docx	application/vnd.openxmlformats-officedocument.wordprocessingml.document	106169	7	2026-08-12 18:38:02.648112+00
\.


--
-- Data for Name: users; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.users (id, email, password_hash, first_name, last_name, role, faculty, department, phone_number, avatar_url, faculty_number, subject_taught, max_students, created_at, updated_at, specialty, degree, reset_token, reset_token_expiry) FROM stdin;
8	mstefanova@uni.bg	8ed16ec60fd929f06bddcebcbe925078c5decb0bec17ccc201f55906c8a7ea2c	Мария	Стефанова	student	\N	\N	\N	\N	121222044	\N	40	2026-08-12 20:34:28.547151+00	2026-08-12 20:34:28.547151+00	\N	\N	\N	\N
2	iivanova@uni.bg	9d95a4d77b7829b950f99751c7b296c48dd7dbf7acf7a68c7a002e0b51fd2955	Ива	Иванова	department_head	\N	\N	\N	\N	\N	\N	10	2026-08-09 15:00:05.464964+00	2026-08-09 15:00:05.464964+00	\N	\N	\N	\N
11	tbozhilov@uni.bg	2fcde602af2919866d703b5d31244af88173408cb99accd50938beaca87609b5	Тодор	Божилов	supervisor	ФМИ	МИ	\N	\N	\N	Математика	10	2026-08-13 19:21:00.670474+00	2026-08-16 16:42:04.909+00	\N	\N	\N	\N
9	syordanov@uni.bg	655fbed07407132500c90571b5ec7b1edadf12fcc7aedd78a73eb4f674c92912	Станислав	Йорданов	supervisor	ФКС	КС	\N	\N	\N	ИКС	10	2026-08-13 16:45:43.367694+00	2026-08-13 16:45:43.367694+00	\N	\N	\N	\N
12	ntsanev@uni.bg	ead36637669c81e077453a6a8d8ef739c7a54447d3f4b66b78704d9bdbcbd272	Николай	Цанев	supervisor	ФКСТ	ФКТ	\N	\N	\N	ИИ	10	2026-08-13 20:04:14.075837+00	2026-08-13 20:04:14.075837+00	\N	\N	\N	\N
7	itodorov@uni.bg	5fd56104297a82c0a6b396e2e7e4b8b31840e076eb6a2f39ab93bd1051629ad6	Иван	Тодоров	student	ФКСТ	\N	\N	\N	121222179	\N	40	2026-08-12 18:37:08.236964+00	2026-08-16 20:56:02.482+00	КСИ	bachelor	\N	\N
1	kgeorgieva@uni.bg	1d06cc9e21c08231cfb41a1ed7787e83412f72c831e5b8ca042175b332e654f1	Катя	Георгиева	student	ФКС	\N	\N	\N	121222033	\N	40	2026-08-09 14:59:13.902607+00	2026-08-14 16:55:25.475+00	МИ	bachelor	\N	\N
5	masenova@uni.bg	4b418df1a968db29f995c987d52aafdd5b3cfdb332ce5fd682568cd915cbf035	Мария	Асенова	supervisor	ФМИ	Информатика	\N	\N	\N	МИ	10	2026-08-09 15:08:14.118415+00	2026-08-16 21:47:15.119+00	\N	\N	\N	\N
10	jdanchev@uni.bg	01283a4c8b41bf13b1095585307879af9d0728d8060bb3928a713e84ed4db971	Живко	Данчев	supervisor	ФМИ	МИ	\N	\N	\N	ИКС	10	2026-08-13 19:20:00.379633+00	2026-08-16 16:05:19.652+00	\N	\N	jyu4n5rustkmsvzxkf8	2026-08-16 17:05:19.652+00
4	iangelov@uni.bg	bb3dbd297b3427e51b02dcecaa75f0e8de1968f2653baaa6c2dfb69779dcc932	Ivo	Angelov	admin			0891345679	\N	\N	\N	40	2026-08-09 15:03:51.131588+00	2026-08-17 10:22:49.834+00	\N	\N	\N	\N
6	givanov@uni.bg	d879515e3bb5a9c867d4651de66cfa29fc2800eacd7758922e9050e9e7658128	Георги	Иванов	supervisor	\N	\N	\N	\N	001212012	\N	10	2026-08-09 15:44:34.423248+00	2026-08-16 16:14:18.337+00	\N	\N	zwpsmnttxjmsw0942o	2026-08-16 17:14:18.336+00
\.


--
-- Name: audit_log_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.audit_log_id_seq', 137, true);


--
-- Name: committee_members_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.committee_members_id_seq', 44, true);


--
-- Name: committees_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.committees_id_seq', 9, true);


--
-- Name: defense_grades_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.defense_grades_id_seq', 14, true);


--
-- Name: defense_students_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.defense_students_id_seq', 1, false);


--
-- Name: defenses_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.defenses_id_seq', 2, true);


--
-- Name: grades_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.grades_id_seq', 1, false);


--
-- Name: messages_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.messages_id_seq', 7, true);


--
-- Name: notifications_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.notifications_id_seq', 99, true);


--
-- Name: reviews_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.reviews_id_seq', 1, true);


--
-- Name: student_committees_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.student_committees_id_seq', 7, true);


--
-- Name: supervisor_requests_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.supervisor_requests_id_seq', 3, true);


--
-- Name: theses_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.theses_id_seq', 2, true);


--
-- Name: thesis_files_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.thesis_files_id_seq', 3, true);


--
-- Name: users_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.users_id_seq', 14, true);


--
-- Name: audit_log audit_log_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.audit_log
    ADD CONSTRAINT audit_log_pkey PRIMARY KEY (id);


--
-- Name: committee_members committee_members_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.committee_members
    ADD CONSTRAINT committee_members_pkey PRIMARY KEY (id);


--
-- Name: committees committees_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.committees
    ADD CONSTRAINT committees_pkey PRIMARY KEY (id);


--
-- Name: committees committees_roman_numeral_unique; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.committees
    ADD CONSTRAINT committees_roman_numeral_unique UNIQUE (roman_numeral);


--
-- Name: defense_grades defense_grades_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.defense_grades
    ADD CONSTRAINT defense_grades_pkey PRIMARY KEY (id);


--
-- Name: defense_students defense_students_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.defense_students
    ADD CONSTRAINT defense_students_pkey PRIMARY KEY (id);


--
-- Name: defenses defenses_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.defenses
    ADD CONSTRAINT defenses_pkey PRIMARY KEY (id);


--
-- Name: grades grades_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.grades
    ADD CONSTRAINT grades_pkey PRIMARY KEY (id);


--
-- Name: messages messages_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.messages
    ADD CONSTRAINT messages_pkey PRIMARY KEY (id);


--
-- Name: notifications notifications_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.notifications
    ADD CONSTRAINT notifications_pkey PRIMARY KEY (id);


--
-- Name: reviews reviews_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.reviews
    ADD CONSTRAINT reviews_pkey PRIMARY KEY (id);


--
-- Name: student_committees student_committees_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.student_committees
    ADD CONSTRAINT student_committees_pkey PRIMARY KEY (id);


--
-- Name: student_committees student_committees_student_id_unique; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.student_committees
    ADD CONSTRAINT student_committees_student_id_unique UNIQUE (student_id);


--
-- Name: supervisor_requests supervisor_requests_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.supervisor_requests
    ADD CONSTRAINT supervisor_requests_pkey PRIMARY KEY (id);


--
-- Name: theses theses_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.theses
    ADD CONSTRAINT theses_pkey PRIMARY KEY (id);


--
-- Name: thesis_files thesis_files_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.thesis_files
    ADD CONSTRAINT thesis_files_pkey PRIMARY KEY (id);


--
-- Name: users users_email_unique; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_email_unique UNIQUE (email);


--
-- Name: users users_faculty_number_unique; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_faculty_number_unique UNIQUE (faculty_number);


--
-- Name: users users_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_pkey PRIMARY KEY (id);


--
-- Name: audit_log audit_log_user_id_users_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.audit_log
    ADD CONSTRAINT audit_log_user_id_users_id_fk FOREIGN KEY (user_id) REFERENCES public.users(id);


--
-- Name: committee_members committee_members_committee_id_committees_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.committee_members
    ADD CONSTRAINT committee_members_committee_id_committees_id_fk FOREIGN KEY (committee_id) REFERENCES public.committees(id) ON DELETE CASCADE;


--
-- Name: committee_members committee_members_user_id_users_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.committee_members
    ADD CONSTRAINT committee_members_user_id_users_id_fk FOREIGN KEY (user_id) REFERENCES public.users(id) ON DELETE CASCADE;


--
-- Name: defense_students defense_students_defense_id_defenses_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.defense_students
    ADD CONSTRAINT defense_students_defense_id_defenses_id_fk FOREIGN KEY (defense_id) REFERENCES public.defenses(id) ON DELETE CASCADE;


--
-- Name: defense_students defense_students_student_id_users_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.defense_students
    ADD CONSTRAINT defense_students_student_id_users_id_fk FOREIGN KEY (student_id) REFERENCES public.users(id) ON DELETE CASCADE;


--
-- Name: grades grades_grader_id_users_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.grades
    ADD CONSTRAINT grades_grader_id_users_id_fk FOREIGN KEY (grader_id) REFERENCES public.users(id);


--
-- Name: grades grades_thesis_id_theses_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.grades
    ADD CONSTRAINT grades_thesis_id_theses_id_fk FOREIGN KEY (thesis_id) REFERENCES public.theses(id) ON DELETE CASCADE;


--
-- Name: messages messages_receiver_id_users_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.messages
    ADD CONSTRAINT messages_receiver_id_users_id_fk FOREIGN KEY (receiver_id) REFERENCES public.users(id) ON DELETE CASCADE;


--
-- Name: messages messages_sender_id_users_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.messages
    ADD CONSTRAINT messages_sender_id_users_id_fk FOREIGN KEY (sender_id) REFERENCES public.users(id) ON DELETE CASCADE;


--
-- Name: notifications notifications_user_id_users_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.notifications
    ADD CONSTRAINT notifications_user_id_users_id_fk FOREIGN KEY (user_id) REFERENCES public.users(id) ON DELETE CASCADE;


--
-- Name: reviews reviews_reviewer_id_users_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.reviews
    ADD CONSTRAINT reviews_reviewer_id_users_id_fk FOREIGN KEY (reviewer_id) REFERENCES public.users(id);


--
-- Name: reviews reviews_thesis_id_theses_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.reviews
    ADD CONSTRAINT reviews_thesis_id_theses_id_fk FOREIGN KEY (thesis_id) REFERENCES public.theses(id) ON DELETE CASCADE;


--
-- Name: student_committees student_committees_committee_id_committees_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.student_committees
    ADD CONSTRAINT student_committees_committee_id_committees_id_fk FOREIGN KEY (committee_id) REFERENCES public.committees(id) ON DELETE CASCADE;


--
-- Name: student_committees student_committees_student_id_users_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.student_committees
    ADD CONSTRAINT student_committees_student_id_users_id_fk FOREIGN KEY (student_id) REFERENCES public.users(id) ON DELETE CASCADE;


--
-- Name: supervisor_requests supervisor_requests_reviewer_id_users_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.supervisor_requests
    ADD CONSTRAINT supervisor_requests_reviewer_id_users_id_fk FOREIGN KEY (reviewer_id) REFERENCES public.users(id);


--
-- Name: supervisor_requests supervisor_requests_student_id_users_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.supervisor_requests
    ADD CONSTRAINT supervisor_requests_student_id_users_id_fk FOREIGN KEY (student_id) REFERENCES public.users(id) ON DELETE CASCADE;


--
-- Name: supervisor_requests supervisor_requests_supervisor_id_users_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.supervisor_requests
    ADD CONSTRAINT supervisor_requests_supervisor_id_users_id_fk FOREIGN KEY (supervisor_id) REFERENCES public.users(id) ON DELETE CASCADE;


--
-- Name: theses theses_reviewer_id_users_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.theses
    ADD CONSTRAINT theses_reviewer_id_users_id_fk FOREIGN KEY (reviewer_id) REFERENCES public.users(id);


--
-- Name: theses theses_student_id_users_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.theses
    ADD CONSTRAINT theses_student_id_users_id_fk FOREIGN KEY (student_id) REFERENCES public.users(id);


--
-- Name: theses theses_supervisor_id_users_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.theses
    ADD CONSTRAINT theses_supervisor_id_users_id_fk FOREIGN KEY (supervisor_id) REFERENCES public.users(id);


--
-- Name: thesis_files thesis_files_thesis_id_theses_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.thesis_files
    ADD CONSTRAINT thesis_files_thesis_id_theses_id_fk FOREIGN KEY (thesis_id) REFERENCES public.theses(id) ON DELETE CASCADE;


--
-- Name: thesis_files thesis_files_uploaded_by_users_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.thesis_files
    ADD CONSTRAINT thesis_files_uploaded_by_users_id_fk FOREIGN KEY (uploaded_by) REFERENCES public.users(id);


--
-- PostgreSQL database dump complete
--

\unrestrict 4MWL9K6P5HMo30qIA3c5c3vMWXwKU4oFVxc13Ghh8H6Qh3S7X28cUrqgazeJ4VP

