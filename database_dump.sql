--
-- PostgreSQL database dump
--

\restrict GIhIzoxXKcFP0ab6wlYEM2pHfVFueEysJvAEfFHuvzfXMWFDTWWOTplDqMK5D2m

-- Dumped from database version 18.6
-- Dumped by pg_dump version 18.6

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
-- Name: departments; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.departments (
    id integer NOT NULL,
    name text NOT NULL,
    faculty text NOT NULL,
    specialties text[] DEFAULT '{}'::text[] NOT NULL,
    faculty_number_prefix text,
    faculty_number_prefix_master text
);


ALTER TABLE public.departments OWNER TO postgres;

--
-- Name: departments_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.departments_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.departments_id_seq OWNER TO postgres;

--
-- Name: departments_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.departments_id_seq OWNED BY public.departments.id;


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
-- Name: departments id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.departments ALTER COLUMN id SET DEFAULT nextval('public.departments_id_seq'::regclass);


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
1	5	login	user	5	{"role": "reviewer", "email": "masenova@mail.bg"}	2026-08-11 19:52:16.922654+03
2	4	login	user	4	{"role": "admin", "email": "iangelov@abv.bg"}	2026-08-11 19:52:27.205033+03
3	6	login	user	6	{"role": "supervisor", "email": "givanov@uni.bg"}	2026-08-11 22:09:01.238387+03
4	2	login	user	2	{"role": "department_head", "email": "iivanova@abv.bg"}	2026-08-11 22:09:25.08284+03
5	4	login	user	4	{"role": "admin", "email": "iangelov@abv.bg"}	2026-08-11 22:11:28.112025+03
6	1	login	user	1	{"role": "student", "email": "kgeorgieva@uni.bg"}	2026-08-11 22:12:20.381791+03
7	4	login	user	4	{"role": "admin", "email": "iangelov@abv.bg"}	2026-08-11 22:26:38.465511+03
8	5	login	user	5	{"role": "reviewer", "email": "masenova@mail.bg"}	2026-08-11 22:31:15.226526+03
9	6	login	user	6	{"role": "supervisor", "email": "givanov@uni.bg"}	2026-08-11 23:37:00.376136+03
10	5	login	user	5	{"role": "reviewer", "email": "masenova@mail.bg"}	2026-08-11 23:41:02.832837+03
11	5	login	user	5	{"role": "reviewer", "email": "masenova@mail.bg"}	2026-08-12 13:48:44.265469+03
12	4	login	user	4	{"role": "admin", "email": "iangelov@abv.bg"}	2026-08-12 13:49:19.865983+03
13	5	login	user	5	{"role": "reviewer", "email": "masenova@mail.bg"}	2026-08-12 13:52:40.742238+03
14	6	login	user	6	{"role": "supervisor", "email": "givanov@uni.bg"}	2026-08-12 13:57:17.160037+03
15	4	login	user	4	{"role": "admin", "email": "iangelov@abv.bg"}	2026-08-12 13:57:32.80809+03
16	5	login	user	5	{"role": "reviewer", "email": "masenova@mail.bg"}	2026-08-12 14:34:56.794061+03
17	2	login	user	2	{"role": "department_head", "email": "iivanova@abv.bg"}	2026-08-12 15:18:25.772443+03
18	2	login	user	2	{"role": "department_head", "email": "iivanova@abv.bg"}	2026-08-12 15:24:16.811279+03
19	1	login	user	1	{"role": "student", "email": "kgeorgieva@uni.bg"}	2026-08-12 15:32:53.305179+03
20	1	create_thesis	thesis	1	{"title": "Автоматизация на болничния процес"}	2026-08-12 18:01:27.720117+03
21	6	login	user	6	{"role": "supervisor", "email": "givanov@uni.bg"}	2026-08-12 18:42:22.344229+03
22	1	submit_thesis	thesis	1	{"title": "Автоматизация на болничния процес"}	2026-08-12 19:10:59.906128+03
23	6	login	user	6	{"role": "supervisor", "email": "givanov@uni.bg"}	2026-08-12 19:11:27.310111+03
24	6	login	user	6	{"role": "supervisor", "email": "givanov@uni.bg"}	2026-08-12 19:22:59.468155+03
25	6	approve_thesis	thesis	1	{"title": "Автоматизация на болничния процес"}	2026-08-12 19:30:04.015122+03
26	5	login	user	5	{"role": "reviewer", "email": "masenova@mail.bg"}	2026-08-12 19:48:55.831854+03
27	6	login	user	6	{"role": "supervisor", "email": "givanov@uni.bg"}	2026-08-12 19:52:10.789932+03
28	7	create_thesis	thesis	2	{"title": "Сайт за автомоболи"}	2026-08-12 21:37:37.438268+03
29	6	login	user	6	{"role": "supervisor", "email": "givanov@uni.bg"}	2026-08-12 21:41:55.962491+03
30	7	submit_thesis	thesis	2	{"title": "Сайт за автомоболи"}	2026-08-12 21:43:28.271206+03
31	6	approve_thesis	thesis	2	{"title": "Сайт за автомоболи"}	2026-08-12 21:48:43.24529+03
32	5	login	user	5	{"role": "reviewer", "email": "masenova@mail.bg"}	2026-08-12 21:59:30.96964+03
33	5	publish_review	review	1	{"thesisId": 2, "recommendation": "approve"}	2026-08-12 22:07:53.422541+03
34	2	login	user	2	{"role": "department_head", "email": "iivanova@abv.bg"}	2026-08-12 23:41:52.72273+03
35	7	login	user	7	{"role": "student", "email": "itodorov@uni.bg"}	2026-08-13 14:46:30.407138+03
36	1	login	user	1	{"role": "student", "email": "kgeorgieva@uni.bg"}	2026-08-13 15:08:36.530363+03
38	7	login	user	7	{"role": "student", "email": "itodorov@uni.bg"}	2026-08-13 15:37:01.017137+03
39	4	login	user	4	{"role": "admin", "email": "iangelov@uni.bg"}	2026-08-13 19:11:02.12329+03
40	4	login	user	4	{"role": "admin", "email": "iangelov@uni.bg"}	2026-08-13 19:30:26.775246+03
41	2	login	user	2	{"role": "department_head", "email": "iivanova@uni.bg"}	2026-08-13 21:43:45.802193+03
42	7	login	user	7	{"role": "student", "email": "itodorov@uni.bg"}	2026-08-13 21:45:38.724875+03
43	4	login	user	4	{"role": "admin", "email": "iangelov@uni.bg"}	2026-08-13 22:15:27.332747+03
44	4	create_user	user	10	{"name": "Живко Данчев", "role": "supervisor", "email": "jdanchev@uni.bg"}	2026-08-13 22:20:00.393784+03
45	4	create_user	user	11	{"name": "Тодор Божилов", "role": "supervisor", "email": "tbozhilov@uni.bg"}	2026-08-13 22:21:00.672042+03
46	7	login	user	7	{"role": "student", "email": "itodorov@uni.bg"}	2026-08-13 22:21:24.110945+03
47	7	login	user	7	{"role": "student", "email": "itodorov@uni.bg"}	2026-08-13 22:46:05.295879+03
48	4	login	user	4	{"role": "admin", "email": "iangelov@uni.bg"}	2026-08-13 23:03:14.716869+03
49	4	create_user	user	12	{"name": "Николай Цанев", "role": "supervisor", "email": "ntsanev@uni.bg"}	2026-08-13 23:04:14.077347+03
50	7	login	user	7	{"role": "student", "email": "itodorov@uni.bg"}	2026-08-13 23:05:24.250329+03
51	7	login	user	7	{"role": "student", "email": "itodorov@uni.bg"}	2026-08-13 23:21:41.068195+03
52	2	login	user	2	{"role": "department_head", "email": "iivanova@uni.bg"}	2026-08-13 23:22:03.209018+03
53	6	login	user	6	{"role": "supervisor", "email": "givanov@uni.bg"}	2026-08-14 14:30:21.149374+03
54	4	login	user	4	{"role": "admin", "email": "iangelov@uni.bg"}	2026-08-14 15:10:26.768048+03
55	4	update_user	user	7	{"name": "Иван Тодоров"}	2026-08-14 15:11:17.037869+03
56	2	login	user	2	{"role": "department_head", "email": "iivanova@uni.bg"}	2026-08-14 17:24:29.708351+03
58	5	login	user	5	{"role": "reviewer", "email": "masenova@uni.bg"}	2026-08-14 17:39:22.018354+03
59	5	login	user	5	{"role": "reviewer", "email": "masenova@uni.bg"}	2026-08-14 18:53:00.071268+03
60	2	login	user	2	{"role": "department_head", "email": "iivanova@uni.bg"}	2026-08-14 18:53:41.703865+03
61	5	login	user	5	{"role": "reviewer", "email": "masenova@uni.bg"}	2026-08-14 19:07:24.668707+03
62	4	update_user	user	7	{"name": "Иван Тодоров"}	2026-08-14 19:32:33.071401+03
63	6	login	user	6	{"role": "supervisor", "email": "givanov@uni.bg"}	2026-08-14 19:35:37.683762+03
64	7	login	user	7	{"role": "student", "email": "itodorov@uni.bg"}	2026-08-14 19:36:16.930537+03
65	4	update_user	user	7	{"name": "Иван Тодоров"}	2026-08-14 19:50:48.742345+03
66	4	update_user	user	1	{"name": "Катя Георгиева"}	2026-08-14 19:55:25.479337+03
67	7	login	user	7	{"role": "student", "email": "itodorov@uni.bg"}	2026-08-14 21:25:36.468841+03
68	6	login	user	6	{"role": "supervisor", "email": "givanov@uni.bg"}	2026-08-14 21:44:30.651709+03
69	5	login	user	5	{"role": "reviewer", "email": "masenova@uni.bg"}	2026-08-14 21:57:41.006628+03
70	12	login	user	12	{"role": "supervisor", "email": "ntsanev@uni.bg"}	2026-08-14 21:58:38.448646+03
71	4	login	user	4	{"role": "admin", "email": "iangelov@uni.bg"}	2026-08-14 22:07:38.309285+03
72	7	login	user	7	{"role": "student", "email": "itodorov@uni.bg"}	2026-08-14 22:12:20.499188+03
73	12	login	user	12	{"role": "supervisor", "email": "ntsanev@uni.bg"}	2026-08-14 22:12:40.510636+03
74	5	login	user	5	{"role": "reviewer", "email": "masenova@uni.bg"}	2026-08-14 22:57:47.069553+03
75	9	login	user	9	{"role": "supervisor", "email": "syordanov@uni.bg"}	2026-08-14 23:01:02.891679+03
76	7	login	user	7	{"role": "student", "email": "itodorov@uni.bg"}	2026-08-14 23:05:35.487528+03
77	12	login	user	12	{"role": "supervisor", "email": "ntsanev@uni.bg"}	2026-08-14 23:18:49.699005+03
78	12	login	user	12	{"role": "supervisor", "email": "ntsanev@uni.bg"}	2026-08-15 00:02:00.778189+03
79	6	login	user	6	{"role": "supervisor", "email": "givanov@uni.bg"}	2026-08-16 17:50:37.275768+03
80	2	login	user	2	{"role": "department_head", "email": "iivanova@uni.bg"}	2026-08-16 18:07:03.355206+03
81	4	login	user	4	{"role": "admin", "email": "iangelov@uni.bg"}	2026-08-16 18:30:18.896422+03
82	5	login	user	5	{"role": "reviewer", "email": "masenova@uni.bg"}	2026-08-16 18:32:11.190858+03
83	2	login	user	2	{"role": "department_head", "email": "iivanova@uni.bg"}	2026-08-16 19:05:03.72865+03
84	4	login	user	4	{"role": "admin", "email": "iangelov@uni.bg"}	2026-08-16 19:26:58.297257+03
85	4	update_user	user	11	{"name": "Тодор Божилов"}	2026-08-16 19:29:06.222096+03
86	11	login	user	11	{"role": "supervisor", "email": "tbozhilov@uni.bg"}	2026-08-16 19:29:56.651767+03
87	4	update_user	user	11	{"name": "Тодор Божилов"}	2026-08-16 19:34:29.157522+03
88	11	login	user	11	{"role": "supervisor", "email": "tbozhilov@uni.bg"}	2026-08-16 19:34:51.00471+03
89	4	update_user	user	11	{"name": "Тодор Божилов"}	2026-08-16 19:35:46.108337+03
90	4	update_user	user	11	{"name": "Тодор Божилов"}	2026-08-16 19:36:18.481548+03
91	4	update_user	user	11	{"name": "Тодор Божилов"}	2026-08-16 19:39:08.280913+03
92	4	update_user	user	11	{"name": "Тодор Божилов"}	2026-08-16 19:39:39.629338+03
93	4	update_user	user	11	{"name": "Тодор Божилов"}	2026-08-16 19:41:25.835072+03
94	11	login	user	11	{"role": "supervisor", "email": "tbozhilov@uni.bg"}	2026-08-16 19:41:40.477542+03
95	4	update_user	user	11	{"name": "Тодор Божилов"}	2026-08-16 19:42:04.912137+03
96	11	login	user	11	{"role": "supervisor", "email": "tbozhilov@uni.bg"}	2026-08-16 19:42:08.896288+03
97	2	login	user	2	{"role": "department_head", "email": "iivanova@uni.bg"}	2026-08-16 20:17:57.828903+03
98	2	login	user	2	{"role": "department_head", "email": "iivanova@uni.bg"}	2026-08-16 23:32:49.063928+03
99	7	login	user	7	{"role": "student", "email": "itodorov@uni.bg"}	2026-08-16 23:51:07.727866+03
100	4	login	user	4	{"role": "admin", "email": "iangelov@uni.bg"}	2026-08-16 23:55:47.674689+03
101	4	update_user	user	7	{"name": "Иван Тодоров"}	2026-08-16 23:55:58.820973+03
102	4	update_user	user	7	{"name": "Иван Тодоров"}	2026-08-16 23:56:02.484351+03
103	2	login	user	2	{"role": "department_head", "email": "iivanova@uni.bg"}	2026-08-17 00:21:26.548318+03
104	4	update_user	user	5	{"name": "Мария Асенова"}	2026-08-17 00:47:15.142963+03
105	4	update_user	user	4	{"name": "Ivo Angelov"}	2026-08-17 13:22:49.842027+03
106	6	login	user	6	{"role": "supervisor", "email": "givanov@uni.bg"}	2026-08-17 13:27:11.881027+03
107	2	login	user	2	{"role": "department_head", "email": "iivanova@uni.bg"}	2026-08-17 13:44:06.140957+03
108	4	login	user	4	{"role": "admin", "email": "iangelov@uni.bg"}	2026-08-17 13:48:24.419033+03
109	7	login	user	7	{"role": "student", "email": "itodorov@uni.bg"}	2026-08-17 13:50:53.292095+03
110	6	login	user	6	{"role": "supervisor", "email": "givanov@uni.bg"}	2026-08-17 14:00:10.001305+03
111	7	login	user	7	{"role": "student", "email": "itodorov@uni.bg"}	2026-08-17 14:12:46.789095+03
112	12	login	user	12	{"role": "supervisor", "email": "ntsanev@uni.bg"}	2026-08-17 14:13:03.247921+03
113	12	create_grade	defense	1	{"grade": 6, "studentId": 7}	2026-08-17 14:13:10.380938+03
114	12	create_grade	defense	1	{"grade": 6, "studentId": 7}	2026-08-17 14:20:05.129641+03
115	7	login	user	7	{"role": "student", "email": "itodorov@uni.bg"}	2026-08-17 14:24:27.272664+03
116	12	create_grade	defense	1	{"grade": 6, "studentId": 7}	2026-08-17 14:28:29.950348+03
117	12	create_grade	defense	1	{"grade": 5.75, "studentId": 7}	2026-08-17 14:33:14.569455+03
118	6	login	user	6	{"role": "supervisor", "email": "givanov@uni.bg"}	2026-08-17 14:43:42.804073+03
119	7	login	user	7	{"role": "student", "email": "itodorov@uni.bg"}	2026-08-17 14:54:00.056798+03
120	1	login	user	1	{"role": "student", "email": "kgeorgieva@uni.bg"}	2026-08-17 14:55:41.024299+03
121	4	login	user	4	{"role": "admin", "email": "iangelov@uni.bg"}	2026-08-17 14:56:11.62339+03
123	7	login	user	7	{"role": "student", "email": "itodorov@uni.bg"}	2026-08-17 14:57:00.99065+03
124	5	login	user	5	{"role": "supervisor", "email": "masenova@uni.bg"}	2026-08-17 14:59:39.967626+03
125	4	login	user	4	{"role": "admin", "email": "iangelov@uni.bg"}	2026-08-17 15:00:05.327711+03
126	2	login	user	2	{"role": "department_head", "email": "iivanova@uni.bg"}	2026-08-17 15:02:49.435136+03
127	6	login	user	6	{"role": "supervisor", "email": "givanov@uni.bg"}	2026-08-17 15:05:12.441927+03
128	4	login	user	4	{"role": "admin", "email": "iangelov@uni.bg"}	2026-08-17 15:19:31.939764+03
129	7	login	user	7	{"role": "student", "email": "itodorov@uni.bg"}	2026-08-17 15:22:01.346317+03
130	2	login	user	2	{"role": "department_head", "email": "iivanova@uni.bg"}	2026-08-17 15:23:36.983422+03
131	5	login	user	5	{"role": "supervisor", "email": "masenova@uni.bg"}	2026-08-17 15:25:08.514089+03
132	7	login	user	7	{"role": "student", "email": "itodorov@uni.bg"}	2026-08-17 15:25:39.349797+03
133	2	login	user	2	{"role": "department_head", "email": "iivanova@uni.bg"}	2026-08-17 15:31:17.901005+03
134	7	login	user	7	{"role": "student", "email": "itodorov@uni.bg"}	2026-08-17 17:08:30.04082+03
135	5	login	user	5	{"role": "supervisor", "email": "masenova@uni.bg"}	2026-08-17 17:08:50.5689+03
136	4	login	user	4	{"role": "admin", "email": "iangelov@uni.bg"}	2026-08-17 17:45:26.502469+03
137	6	login	user	6	{"role": "supervisor", "email": "givanov@uni.bg"}	2026-08-17 17:54:18.13924+03
138	4	update_user	user	12	{"name": "Николай Цанев"}	2026-08-17 19:39:39.268952+03
139	4	update_user	user	12	{"name": "Николай Цанев"}	2026-08-17 19:42:01.615499+03
140	4	update_user	user	12	{"name": "Николай Цанев"}	2026-08-17 19:44:29.483369+03
141	4	update_user	user	12	{"name": "Николай Цанев"}	2026-08-17 19:48:14.73066+03
142	2	login	user	2	{"role": "department_head", "email": "iivanova@uni.bg"}	2026-08-17 21:29:10.645421+03
143	4	login	user	4	{"role": "admin", "email": "iangelov@uni.bg"}	2026-08-17 21:32:55.240362+03
144	4	create_user	user	15	{"name": "Добромир Колев", "role": "department_head", "email": "dkolev@uni.bg"}	2026-08-17 21:35:59.207337+03
145	4	create_user	user	16	{"name": "Михаил Добрев", "role": "student", "email": "mdobrev@uni.bg"}	2026-08-17 21:40:36.403339+03
146	4	create_user	user	17	{"name": "Ралица Стоименова", "role": "student", "email": "rstoimenova@uni.bg"}	2026-08-17 21:41:16.452716+03
147	15	login	user	15	{"role": "department_head", "email": "dkolev@uni.bg"}	2026-08-17 21:42:06.676971+03
148	4	update_user	user	8	{"name": "Мария Стефанова"}	2026-08-17 21:43:04.935686+03
149	2	login	user	2	{"role": "department_head", "email": "iivanova@uni.bg"}	2026-08-17 21:59:05.297879+03
150	2	delete_defense	defense	2	{"title": "Защита 2"}	2026-08-17 21:59:27.085219+03
151	2	delete_committee	committee	3	{"romanNumeral": "I"}	2026-08-17 21:59:52.38446+03
152	4	delete_user	user	10	{"name": "Живко Данчев", "email": "jdanchev@uni.bg"}	2026-08-17 22:09:15.699197+03
153	7	login	user	7	{"role": "student", "email": "itodorov@uni.bg"}	2026-08-17 22:09:51.173864+03
154	4	login	user	4	{"role": "admin", "email": "iangelov@uni.bg"}	2026-08-17 22:10:08.308474+03
155	4	update_user	user	12	{"name": "Николай Цанев"}	2026-08-17 22:10:24.143571+03
156	4	update_user	user	15	{"name": "Добромир Колев"}	2026-08-17 22:10:32.495824+03
157	4	update_user	user	15	{"name": "Добромир Колев"}	2026-08-17 22:10:54.974626+03
158	4	update_user	user	9	{"name": "Станислав Йорданов"}	2026-08-17 22:11:22.235896+03
159	4	update_user	user	9	{"name": "Станислав Йорданов"}	2026-08-17 22:11:26.74126+03
160	4	update_user	user	11	{"name": "Тодор Божилов"}	2026-08-17 22:11:59.107026+03
161	4	update_user	user	2	{"name": "Ива Иванова"}	2026-08-17 22:12:32.863483+03
162	4	update_user	user	6	{"name": "Георги Иванов"}	2026-08-17 22:14:06.637864+03
163	4	create_user	user	18	{"name": "Зорница Христова", "role": "department_head", "email": "zhristova@uni.bg"}	2026-08-17 22:15:16.55784+03
164	4	create_user	user	19	{"name": "Габриел Антов", "role": "department_head", "email": "gantov@uni.bg"}	2026-08-17 22:16:59.243327+03
165	4	create_user	user	20	{"name": "Ивайло Георгиев", "role": "department_head", "email": "igeorgiev@uni.bg"}	2026-08-17 22:17:59.919633+03
166	4	update_user	user	7	{"name": "Иван Тодоров"}	2026-08-17 22:19:36.109402+03
167	4	update_user	user	1	{"name": "Катя Георгиева"}	2026-08-17 22:19:54.202987+03
168	4	update_user	user	16	{"name": "Михаил Добрев"}	2026-08-17 22:20:00.083904+03
169	4	create_user	user	21	{"name": "Йоан Енев", "role": "student", "email": "yenev@uni.bg"}	2026-08-17 22:21:00.16451+03
170	4	update_user	user	5	{"name": "Мария Асенова"}	2026-08-17 22:21:44.107436+03
171	4	create_user	user	22	{"name": "Добромира Петрова", "role": "supervisor", "email": "dpetrova@uni.bg"}	2026-08-17 22:22:33.996151+03
172	15	login	user	15	{"role": "department_head", "email": "dkolev@uni.bg"}	2026-08-17 22:27:29.994141+03
173	17	login	user	17	{"role": "student", "email": "rstoimenova@uni.bg"}	2026-08-17 22:32:32.017714+03
174	15	login	user	15	{"role": "department_head", "email": "dkolev@uni.bg"}	2026-08-17 22:34:32.086711+03
175	15	reject_request	supervisor_request	4	{"studentId": 17, "thesisTitle": "Автоматизация на журнала"}	2026-08-17 22:34:44.532199+03
176	4	login	user	4	{"role": "admin", "email": "iangelov@uni.bg"}	2026-08-17 22:35:21.890053+03
177	12	login	user	12	{"role": "supervisor", "email": "ntsanev@uni.bg"}	2026-08-17 22:36:36.651117+03
178	12	accept_request	supervisor_request	5	{"studentId": 17, "thesisTitle": "Автоматизация на журнала"}	2026-08-17 22:36:51.330424+03
179	12	accept_request	supervisor_request	5	{"studentId": 17, "thesisTitle": "Автоматизация на журнала"}	2026-08-17 22:36:51.331923+03
180	17	create_thesis	thesis	3	{"title": "Автоматизация на журнала"}	2026-08-17 22:37:47.507223+03
181	17	create_thesis	thesis	4	{"title": "Автоматизация на журнала"}	2026-08-17 22:41:35.890188+03
182	17	submit_thesis	thesis	4	{"title": "Автоматизация на журнала"}	2026-08-17 22:42:11.038969+03
183	12	return_thesis	thesis	4	{"title": "Автоматизация на журнала", "comment": "Бъди по-конкретна"}	2026-08-17 22:43:02.958773+03
184	17	submit_thesis	thesis	4	{"title": "Автоматизация на журнала"}	2026-08-17 22:43:33.489419+03
185	4	login	user	4	{"role": "admin", "email": "iangelov@uni.bg"}	2026-08-17 22:44:47.641776+03
186	1	login	user	1	{"role": "student", "email": "kgeorgieva@uni.bg"}	2026-08-17 22:45:38.44178+03
187	4	login	user	4	{"role": "admin", "email": "iangelov@uni.bg"}	2026-08-17 22:46:02.300275+03
188	21	login	user	21	{"role": "student", "email": "yenev@uni.bg"}	2026-08-17 22:46:57.795345+03
189	18	login	user	18	{"role": "department_head", "email": "zhristova@uni.bg"}	2026-08-17 22:48:16.562988+03
190	18	accept_request	supervisor_request	6	{"studentId": 21, "thesisTitle": "GPS system"}	2026-08-17 22:49:09.276532+03
191	18	accept_request	supervisor_request	6	{"studentId": 21, "thesisTitle": "GPS system"}	2026-08-17 22:49:09.278785+03
192	21	create_thesis	thesis	5	{"title": "GPS system"}	2026-08-17 22:50:27.302894+03
193	21	submit_thesis	thesis	5	{"title": "GPS system"}	2026-08-17 22:50:48.872724+03
194	4	login	user	4	{"role": "admin", "email": "iangelov@uni.bg"}	2026-08-17 23:26:13.390382+03
195	5	login	user	5	{"role": "supervisor", "email": "masenova@uni.bg"}	2026-08-17 23:30:51.309649+03
196	18	login	user	18	{"role": "department_head", "email": "zhristova@uni.bg"}	2026-08-17 23:34:27.938067+03
197	17	login	user	17	{"role": "student", "email": "rstoimenova@uni.bg"}	2026-08-17 23:38:16.215436+03
198	18	login	user	18	{"role": "department_head", "email": "zhristova@uni.bg"}	2026-08-17 23:38:44.444746+03
199	17	login	user	17	{"role": "student", "email": "rstoimenova@uni.bg"}	2026-08-17 23:46:16.720629+03
200	21	login	user	21	{"role": "student", "email": "yenev@uni.bg"}	2026-08-17 23:47:58.642125+03
201	21	login	user	21	{"role": "student", "email": "yenev@uni.bg"}	2026-08-17 23:52:32.183603+03
202	4	login	user	4	{"role": "admin", "email": "iangelov@uni.bg"}	2026-08-17 23:55:48.44321+03
203	4	delete_user	user	8	{"name": "Мария Стефанова", "email": "mstefanova@uni.bg"}	2026-08-18 00:05:29.333208+03
204	15	login	user	15	{"role": "department_head", "email": "dkolev@uni.bg"}	2026-08-18 00:06:46.650839+03
205	5	login	user	5	{"role": "supervisor", "email": "masenova@uni.bg"}	2026-08-18 00:12:12.918596+03
206	2	login	user	2	{"role": "department_head", "email": "iivanova@uni.bg"}	2026-08-18 00:12:27.164189+03
207	4	login	user	4	{"role": "admin", "email": "iangelov@uni.bg"}	2026-08-18 00:14:49.478774+03
208	2	login	user	2	{"role": "department_head", "email": "iivanova@uni.bg"}	2026-08-18 00:28:02.485987+03
209	5	login	user	5	{"role": "supervisor", "email": "masenova@uni.bg"}	2026-08-18 00:28:54.122702+03
210	15	login	user	15	{"role": "department_head", "email": "dkolev@uni.bg"}	2026-08-18 01:01:37.863992+03
211	7	login	user	7	{"role": "student", "email": "itodorov@uni.bg"}	2026-08-18 17:22:27.657157+03
212	2	login	user	2	{"role": "department_head", "email": "iivanova@uni.bg"}	2026-08-18 17:40:10.407321+03
213	15	login	user	15	{"role": "department_head", "email": "dkolev@uni.bg"}	2026-08-18 17:40:32.976928+03
214	12	login	user	12	{"role": "supervisor", "email": "ntsanev@uni.bg"}	2026-08-18 17:40:50.317652+03
215	4	login	user	4	{"role": "admin", "email": "iangelov@uni.bg"}	2026-08-18 18:05:41.471227+03
216	7	login	user	7	{"role": "student", "email": "itodorov@uni.bg"}	2026-08-19 22:34:32.797508+03
217	5	login	user	5	{"role": "supervisor", "email": "masenova@uni.bg"}	2026-08-19 22:35:00.678864+03
218	6	login	user	6	{"role": "supervisor", "email": "givanov@uni.bg"}	2026-08-19 22:35:41.917036+03
219	4	login	user	4	{"role": "admin", "email": "iangelov@uni.bg"}	2026-08-19 22:35:57.464816+03
220	28	login	user	28	{"role": "student", "email": "enikolova@uni.bg"}	2026-08-24 15:27:07.901906+03
224	28	create_thesis	thesis	6	{"title": "Болнична система"}	2026-08-24 15:29:44.562569+03
225	28	submit_thesis	thesis	6	{"title": "Болнична система"}	2026-08-24 15:30:33.555584+03
228	12	login	user	12	{"role": "supervisor", "email": "ntsanev@uni.bg"}	2026-08-24 15:36:05.341771+03
229	12	publish_review	review	2	{"thesisId": 6, "recommendation": "approve"}	2026-08-24 15:44:29.978803+03
230	4	login	user	4	{"role": "admin", "email": "iangelov@uni.bg"}	2026-08-24 15:49:53.843135+03
231	59	login	user	59	{"role": "department_head", "email": "kkrasimirov@uni.bg"}	2026-08-24 17:25:47.138176+03
232	61	login	user	61	{"role": "department_head", "email": "vvencisolavov@uni.bg"}	2026-08-24 17:27:10.246373+03
233	15	login	user	15	{"role": "department_head", "email": "dkolev@uni.bg"}	2026-08-24 17:30:36.554026+03
237	2	login	user	2	{"role": "department_head", "email": "iivanova@uni.bg"}	2026-08-24 17:55:12.908859+03
238	2	delete_committee	committee	9	{"romanNumeral": "II"}	2026-08-24 17:55:47.214856+03
239	51	login	user	51	{"role": "student", "email": "kmaneva@uni.bg"}	2026-08-24 18:00:42.101296+03
240	22	login	user	22	{"role": "supervisor", "email": "dpetrova@uni.bg"}	2026-08-24 18:02:38.742899+03
241	22	accept_request	supervisor_request	8	{"studentId": 51, "thesisTitle": "Проектиране на авиционната организация"}	2026-08-24 18:02:43.439141+03
242	22	accept_request	supervisor_request	8	{"studentId": 51, "thesisTitle": "Проектиране на авиционната организация"}	2026-08-24 18:02:43.440757+03
243	51	create_thesis	thesis	7	{"title": "Проектиранe на авиционна организация"}	2026-08-24 18:04:06.792087+03
244	51	submit_thesis	thesis	7	{"title": "Проектиранe на авиционна организация"}	2026-08-24 18:04:43.454513+03
245	22	approve_thesis	thesis	7	{"title": "Проектиранe на авиционна организация"}	2026-08-24 18:05:12.497068+03
246	22	select_reviewer	thesis	7	{"title": "Проектиранe на авиционна организация", "reviewerId": 15}	2026-08-24 18:05:12.833308+03
247	15	login	user	15	{"role": "department_head", "email": "dkolev@uni.bg"}	2026-08-24 18:05:37.334887+03
248	15	publish_review	review	3	{"thesisId": 7, "recommendation": "approve"}	2026-08-24 18:07:33.260041+03
249	5	login	user	5	{"role": "supervisor", "email": "masenova@uni.bg"}	2026-08-24 18:08:34.604377+03
250	2	login	user	2	{"role": "department_head", "email": "iivanova@uni.bg"}	2026-08-24 18:10:09.692694+03
251	2	create_committee	committee	17	{"romanNumeral": "1"}	2026-08-24 18:48:51.72628+03
252	4	update_user	user	56	{"name": "Стефан Стоянов"}	2026-08-24 19:06:39.009394+03
253	4	update_user	user	59	{"name": "Красен Красимиров"}	2026-08-24 19:06:56.423586+03
254	4	update_user	user	63	{"name": "Свилен Светославов"}	2026-08-24 19:07:11.208827+03
255	4	update_user	user	58	{"name": "Тихомир Пламенов"}	2026-08-24 19:07:26.473646+03
256	4	update_user	user	62	{"name": "Михаела Миленова"}	2026-08-24 19:07:36.795805+03
257	4	update_user	user	61	{"name": "Веселин Венциславов"}	2026-08-24 19:07:59.822745+03
258	4	update_user	user	58	{"name": "Панайот Пламенов"}	2026-08-24 19:08:32.133717+03
259	4	update_user	user	57	{"name": "Радост Радкова"}	2026-08-24 19:08:57.589864+03
260	5	login	user	5	{"role": "supervisor", "email": "masenova@uni.bg"}	2026-08-24 19:10:14.134753+03
261	22	login	user	22	{"role": "supervisor", "email": "dpetrova@uni.bg"}	2026-08-24 19:10:57.25771+03
262	51	login	user	51	{"role": "student", "email": "kmaneva@uni.bg"}	2026-08-24 19:11:24.790306+03
263	7	login	user	7	{"role": "student", "email": "itodorov@uni.bg"}	2026-08-24 19:35:10.802013+03
264	51	login	user	51	{"role": "student", "email": "kmaneva@uni.bg"}	2026-08-24 19:36:08.749196+03
266	28	login	user	28	{"role": "student", "email": "enikolova@uni.bg"}	2026-08-24 19:44:59.307648+03
267	2	login	user	2	{"role": "department_head", "email": "iivanova@uni.bg"}	2026-08-24 22:05:01.957744+03
268	2	delete_committee	committee	17	{"romanNumeral": "1"}	2026-08-24 22:05:23.391755+03
269	2	create_committee	committee	18	{"romanNumeral": "1"}	2026-08-24 22:05:31.366319+03
270	2	create_committee	committee	21	{"romanNumeral": "III"}	2026-08-24 22:06:16.439936+03
271	2	delete_committee	committee	10	{"romanNumeral": "I"}	2026-08-24 22:06:26.035691+03
272	2	delete_committee	committee	13	{"romanNumeral": "2"}	2026-08-24 22:06:28.8539+03
273	2	delete_committee	committee	18	{"romanNumeral": "1"}	2026-08-24 22:06:31.481453+03
274	2	delete_committee	committee	21	{"romanNumeral": "III"}	2026-08-24 22:06:33.471202+03
275	5	login	user	5	{"role": "supervisor", "email": "masenova@uni.bg"}	2026-08-24 22:11:00.852329+03
276	6	login	user	6	{"role": "supervisor", "email": "givanov@uni.bg"}	2026-08-24 22:36:44.673692+03
277	4	add_specialty	department	9	{"specialty": "Телекомуникационни мрежи"}	2026-08-24 22:41:54.278745+03
278	4	remove_specialty	department	9	{"specialty": "Телекомуникационни мрежи"}	2026-08-24 22:41:57.996676+03
279	5	login	user	5	{"role": "supervisor", "email": "masenova@uni.bg"}	2026-08-24 22:44:47.216934+03
280	7	login	user	7	{"role": "student", "email": "itodorov@uni.bg"}	2026-08-24 22:50:09.754466+03
281	2	login	user	2	{"role": "department_head", "email": "iivanova@uni.bg"}	2026-08-24 22:54:02.695953+03
282	2	create_committee	committee	22	{"romanNumeral": "I"}	2026-08-24 22:54:11.60492+03
283	2	add_committee_member	committee	22	{"userId": 9, "isChairman": false, "romanNumeral": "I"}	2026-08-24 22:54:24.032025+03
284	2	add_committee_member	committee	22	{"userId": 6, "isChairman": false, "romanNumeral": "I"}	2026-08-24 22:54:24.355761+03
285	2	add_committee_member	committee	22	{"userId": 60, "isChairman": false, "romanNumeral": "I"}	2026-08-24 22:54:24.677034+03
286	2	add_committee_member	committee	22	{"userId": 62, "isChairman": false, "romanNumeral": "I"}	2026-08-24 22:54:25.006646+03
287	2	add_committee_member	committee	22	{"userId": 56, "isChairman": false, "romanNumeral": "I"}	2026-08-24 22:54:25.325301+03
288	2	add_committee_member	committee	22	{"userId": 60, "isChairman": true, "romanNumeral": "I"}	2026-08-24 22:54:29.988699+03
289	2	create_defense	defense	3	{"title": "Защита 1"}	2026-08-24 22:55:06.98898+03
290	6	login	user	6	{"role": "supervisor", "email": "givanov@uni.bg"}	2026-08-24 23:02:01.19925+03
291	5	login	user	5	{"role": "supervisor", "email": "masenova@uni.bg"}	2026-08-24 23:02:21.828026+03
292	2	approve_for_defense	thesis	7	{"title": "Проектиранe на авиционна организация"}	2026-08-24 23:06:49.51687+03
293	51	login	user	51	{"role": "student", "email": "kmaneva@uni.bg"}	2026-08-24 23:07:26.305389+03
294	2	delete_defense	defense	3	{"title": "Защита 1"}	2026-08-24 23:10:40.759408+03
295	2	create_defense	defense	4	{"title": "Защита 2"}	2026-08-24 23:11:02.520168+03
296	2	login	user	2	{"role": "department_head", "email": "iivanova@uni.bg"}	2026-08-24 23:18:03.309037+03
297	5	login	user	5	{"role": "supervisor", "email": "masenova@uni.bg"}	2026-08-25 13:31:12.973026+03
298	7	login	user	7	{"role": "student", "email": "itodorov@uni.bg"}	2026-08-25 13:34:04.785505+03
299	6	login	user	6	{"role": "supervisor", "email": "givanov@uni.bg"}	2026-08-25 13:35:58.918769+03
300	5	login	user	5	{"role": "supervisor", "email": "masenova@uni.bg"}	2026-08-25 13:39:23.557079+03
301	51	login	user	51	{"role": "student", "email": "kmaneva@uni.bg"}	2026-08-25 13:41:07.009129+03
302	60	login	user	60	{"role": "department_head", "email": "tteodorova@uni.bg"}	2026-08-25 13:49:40.165826+03
303	60	create_grade	defense	4	{"grade": 5.5, "studentId": 51}	2026-08-25 13:50:05.608759+03
304	15	login	user	15	{"role": "department_head", "email": "dkolev@uni.bg"}	2026-08-25 13:50:46.361805+03
305	5	login	user	5	{"role": "supervisor", "email": "masenova@uni.bg"}	2026-08-25 14:14:59.9914+03
\.


--
-- Data for Name: committee_members; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.committee_members (id, committee_id, user_id, is_chairman, created_at) FROM stdin;
45	22	9	f	2026-08-24 22:54:24.025965+03
46	22	6	f	2026-08-24 22:54:24.350025+03
48	22	62	f	2026-08-24 22:54:25.00178+03
49	22	56	f	2026-08-24 22:54:25.322895+03
50	22	60	t	2026-08-24 22:54:29.984482+03
\.


--
-- Data for Name: committees; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.committees (id, roman_numeral, description, created_at, updated_at) FROM stdin;
22	I	\N	2026-08-24 22:54:11.596777+03	2026-08-24 22:54:11.596777+03
\.


--
-- Data for Name: defense_grades; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.defense_grades (id, defense_id, student_id, grade, created_at, updated_at) FROM stdin;
14	1	7	5.75	2026-08-17 14:33:14.566777+03	2026-08-17 14:33:14.566777+03
15	4	51	5.50	2026-08-25 13:50:05.601755+03	2026-08-25 13:50:05.601755+03
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
1	Защита 1	2026-08-14 11:30:00+03	\N	2103	2103	08:30		9	{7}	{9}		2026-08-13 23:45:51.410387+03	2026-08-14 00:31:00.017+03
4	Защита 2	2026-08-25 03:00:00+03	\N	3101	3101	08:30		22	{51}	{22}		2026-08-24 23:11:02.517747+03	2026-08-24 23:24:17.098+03
\.


--
-- Data for Name: departments; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.departments (id, name, faculty, specialties, faculty_number_prefix, faculty_number_prefix_master) FROM stdin;
6	Микроелектроника	Факултет „Електронна техника и технологии" (ФЕТТ)	{"Микро- и наноелектроника"}	201222	202222
7	Силова електроника	Факултет „Електронна техника и технологии" (ФЕТТ)	{"Автомобилна електроника"}	211222	212222
8	Радиокомуникации и видеотехнологии	Факултет по телекомуникации (ФТК)	{Телекомуникации}	301222	302222
10	Двигатели, автомобилна техника и транспорт	Факултет по транспорта (ФТ)	{"Автотранспортна техника","Технология и управление на транспорта"}	901222	902222
11	Въздушен транспорт	Факултет по транспорта (ФТ)	{"Авиационна техника и технологии"}	911222	912222
1	Компютърни системи	Факултет „Компютърни системи и технологии" (ФКСТ)	{"Компютърно и софтуерно инженерство"}	121222	122222
2	Програмиране и компютърни технологии	Факултет „Компютърни системи и технологии" (ФКСТ)	{"Компютърни системи и информационни технологии"}	121222	122222
3	Киберсигурност	Факултет „Компютърни системи и технологии" (ФКСТ)	{Киберсигурност}	131222	132222
4	Интелигентни технологии в индустрията	Факултет „Компютърни системи и технологии" (ФКСТ)	{"Информационни технологии в индустрията"}	131222	132222
5	Електронна техника	Факултет „Електронна техника и технологии" (ФЕТТ)	{"Електронни информационни системи"}	221222	222222
12	Железопътна техника и технологии	Факултет по транспорта (ФТ)	{"Транспортна техника и технологии"}	901222	902222
9	Телекомуникационни мрежи	Факултет по телекомуникации (ФТК)	{}	301222	302222
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
1	4	5	Здравейте!	t	2026-08-14 17:44:55.380128+03
2	4	5	📎 [kms-lab2-2025 (1).pdf](/uploads/1786719147901-328355700.pdf)	t	2026-08-14 17:52:28.223434+03
3	5	4	📎 [СМО_Доклад_Вариант20.docx](/uploads/1786719171450-326298022.docx)	t	2026-08-14 17:52:51.61845+03
4	4	5	.\n📎 [kms-lab2-2025 (1).pdf](/uploads/kms-lab2-2025 (1).pdf)	t	2026-08-14 17:59:06.505876+03
5	4	5	доклад\n📎 [СМО_Доклад_Вариант20.docx](/uploads/1786719686314-988420972.docx)	t	2026-08-14 18:01:26.494884+03
6	5	4	проба	t	2026-08-17 14:59:50.168525+03
7	4	5	proba	t	2026-08-17 15:00:20.134598+03
\.


--
-- Data for Name: notifications; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.notifications (id, user_id, title, message, type, is_read, related_thesis_id, created_at) FROM stdin;
1	6	Ново запитване за ръководство	Студент иска да бъдете негов ръководител за: "Автоматизация на болничния процес"	info	t	\N	2026-08-12 18:40:30.22481+03
2	1	Запитването е одобрено!	Вашето запитване за ръководство на "Автоматизация на болничния процес" е одобрено!	success	t	\N	2026-08-12 18:50:33.391142+03
26	11	Добавени сте към комисия	Добавени сте като член на Комисия II	info	f	\N	2026-08-13 23:04:35.797671+03
4	1	Дипломната работа е одобрена	Научният ръководител одобри "Автоматизация на болничния процес"	success	t	1	2026-08-12 19:30:04.016657+03
34	11	Добавени сте към комисия	Добавени сте като член на Комисия II	info	f	\N	2026-08-13 23:18:15.581208+03
20	11	Добавени сте към комисия	Добавени сте като член на Комисия I	info	f	\N	2026-08-13 22:22:25.637365+03
25	12	Добавени сте към комисия	Добавени сте като член на Комисия II	info	t	\N	2026-08-13 23:04:35.588701+03
33	12	Добавени сте към комисия	Добавени сте като член на Комисия II	info	t	\N	2026-08-13 23:18:15.506345+03
36	9	Добавени сте към комисия	Добавени сте като член на Комисия II	info	t	\N	2026-08-13 23:18:15.720056+03
37	2	Добавени сте към комисия	Добавени сте като член на Комисия II	info	t	\N	2026-08-13 23:18:15.796869+03
13	2	Ново запитване за ръководство	Студент иска да бъдете негов ръководител за: "Дронове"	info	t	\N	2026-08-12 23:36:45.663281+03
29	2	Добавени сте към комисия	Добавени сте като член на Комисия II	info	t	\N	2026-08-13 23:04:36.169118+03
18	9	Добавени сте към комисия	Добавени сте като член на Комисия I	info	t	\N	2026-08-13 22:22:25.509301+03
28	9	Добавени сте към комисия	Добавени сте като член на Комисия II	info	t	\N	2026-08-13 23:04:36.015116+03
9	5	Назначени сте за рецензент	Назначени сте за рецензент на "Сайт за автомоболи"	info	t	2	2026-08-12 21:48:43.337765+03
24	5	Добавени сте към комисия	Добавени сте като председател на Комисия I	info	t	\N	2026-08-13 23:02:16.3392+03
17	5	Добавени сте към комисия	Добавени сте като член на Комисия I	info	t	\N	2026-08-13 22:22:25.441002+03
38	9	Добавени сте към комисия	Добавени сте като председател на Комисия II	info	t	\N	2026-08-13 23:18:20.039665+03
3	6	Нова подадена дипломна работа	Студент е подал дипломна работа: "Автоматизация на болничния процес"	info	t	1	2026-08-12 19:10:59.907753+03
5	6	Ново запитване за ръководство	Студент иска да бъдете негов ръководител за: "Сайт за автомобили"	info	t	\N	2026-08-12 21:41:04.119767+03
22	6	Добавени сте към комисия	Добавени сте като член на Комисия I	info	t	\N	2026-08-13 22:24:45.00813+03
7	6	Нова подадена дипломна работа	Студент е подал дипломна работа: "Сайт за автомоболи"	info	t	2	2026-08-12 21:43:28.27276+03
12	6	Рецензията е изготвена	Рецензията на "Сайт за автомоболи" е готова.	info	t	2	2026-08-12 22:07:53.420523+03
23	6	Добавени сте към комисия	Добавени сте като председател на Комисия I	info	t	\N	2026-08-13 22:40:57.986853+03
32	7	Премахнати сте от комисия	Комисия II е изтрита и вие сте премахнати от нея.	warning	t	\N	2026-08-13 23:17:59.151916+03
6	7	Запитването е одобрено!	Вашето запитване за ръководство на "Сайт за автомобили" е одобрено!	success	t	\N	2026-08-12 21:42:13.077663+03
8	7	Дипломната работа е одобрена	Научният ръководител одобри "Сайт за автомоболи"	success	t	2	2026-08-12 21:48:43.246586+03
10	7	Дипломната работа е изпратена за рецензия	"Сайт за автомоболи" е изпратена за рецензия	info	t	2	2026-08-12 21:48:43.34135+03
42	11	Добавени сте към комисия	Добавени сте като член на Комисия II	info	f	\N	2026-08-13 23:22:24.758923+03
45	2	Добавени сте към комисия	Добавени сте като член на Комисия II	info	t	\N	2026-08-13 23:22:25.067016+03
49	2	Добавени сте към комисия	Добавени сте като член на Комисия II	info	t	\N	2026-08-13 23:26:35.789132+03
57	2	Добавени сте към комисия	Добавени сте като член на Комисия II	info	t	\N	2026-08-13 23:29:52.377203+03
65	2	Добавени сте към комисия	Добавени сте като член на Комисия II	info	t	\N	2026-08-13 23:36:20.240553+03
64	7	Премахнати сте от комисия	Комисия II е изтрита и вие сте премахнати от нея.	warning	t	\N	2026-08-13 23:35:47.342543+03
15	7	Допуснати сте до защита!	"Сайт за автомоболи" е допусната до защита	success	t	2	2026-08-13 22:04:46.859246+03
11	7	Рецензията е готова	Вашата дипломна работа "Сайт за автомоболи" получи рецензия.	info	t	2	2026-08-12 22:07:53.418262+03
31	7	Назначени сте към комисия	Назначени сте към Комисия II	info	t	\N	2026-08-13 23:07:20.86151+03
39	7	Назначени сте към комисия	Назначени сте към Комисия II	info	t	\N	2026-08-13 23:18:42.390339+03
53	11	Добавени сте към комисия	Добавени сте като член на Комисия II	info	f	\N	2026-08-13 23:26:36.061912+03
54	11	Добавени сте към комисия	Добавени сте като председател на Комисия II	info	f	\N	2026-08-13 23:26:41.178211+03
60	11	Добавени сте към комисия	Добавени сте като член на Комисия II	info	f	\N	2026-08-13 23:29:52.602611+03
62	11	Добавени сте към комисия	Добавени сте като председател на Комисия II	info	f	\N	2026-08-13 23:29:55.665634+03
68	11	Добавени сте към комисия	Добавени сте като член на Комисия II	info	f	\N	2026-08-13 23:36:20.434752+03
44	9	Добавени сте към комисия	Добавени сте като член на Комисия II	info	t	\N	2026-08-13 23:22:25.005234+03
46	9	Добавени сте към комисия	Добавени сте като председател на Комисия II	info	t	\N	2026-08-13 23:22:29.351331+03
50	9	Добавени сте към комисия	Добавени сте като член на Комисия II	info	t	\N	2026-08-13 23:26:35.866032+03
58	9	Добавени сте към комисия	Добавени сте като член на Комисия II	info	t	\N	2026-08-13 23:29:52.457949+03
66	9	Добавени сте към комисия	Добавени сте като член на Комисия II	info	t	\N	2026-08-13 23:36:20.303083+03
71	7	Назначени сте към комисия	Назначени сте към Комисия II	info	t	\N	2026-08-13 23:37:05.702409+03
72	7	Насрочена защита	Добавени сте към защита "Защита 1" на 16.08.2026 г. в зала 2103	info	t	\N	2026-08-14 00:09:22.709908+03
41	12	Добавени сте към комисия	Добавени сте като член на Комисия II	info	t	\N	2026-08-13 23:22:24.6804+03
52	12	Добавени сте към комисия	Добавени сте като член на Комисия II	info	t	\N	2026-08-13 23:26:35.996888+03
61	12	Добавени сте към комисия	Добавени сте като член на Комисия II	info	t	\N	2026-08-13 23:29:52.667672+03
69	12	Добавени сте към комисия	Добавени сте като член на Комисия II	info	t	\N	2026-08-13 23:36:20.497922+03
70	12	Добавени сте към комисия	Добавени сте като председател на Комисия II	info	t	\N	2026-08-13 23:36:26.11567+03
16	6	Добавени сте към комисия	Добавени сте като член на Комисия I	info	t	\N	2026-08-13 22:22:25.375062+03
21	6	Премахнати сте от комисия	Премахнати сте от Комисия I	warning	t	\N	2026-08-13 22:22:42.925153+03
47	7	Назначени сте към комисия	Назначени сте към Комисия II	info	t	\N	2026-08-13 23:24:39.959715+03
78	7	Нанесена оценка от защита	Вашата оценка от защитата е 5.75 (Отличен)	success	t	\N	2026-08-14 23:28:26.703998+03
79	7	Успешно защитена дипломна работа	Вашата дипломна работа е маркирана като успешно защитена.	success	t	\N	2026-08-14 23:36:44.29281+03
80	7	Нанесена оценка от защита	Вашата оценка от защитата е 5.75 (Отличен)	success	t	\N	2026-08-14 23:37:00.274938+03
81	7	Успешно защитена дипломна работа	Вашата дипломна работа е маркирана като успешно защитена.	success	t	\N	2026-08-14 23:40:30.162006+03
82	7	Нанесена оценка от защита	Вашата оценка от защитата е 5.75 (Отличен)	success	t	\N	2026-08-14 23:40:34.506385+03
83	7	Успешно защитена дипломна работа	Вашата дипломна работа е маркирана като успешно защитена.	success	t	\N	2026-08-14 23:44:32.775239+03
84	7	Нанесена оценка от защита	Вашата оценка от защитата е 5.75 (Отличен)	success	t	\N	2026-08-14 23:44:45.612271+03
85	7	Нанесена оценка от защита	Вашата оценка от защитата е 6.00 (Отличен)	success	t	\N	2026-08-14 23:46:40.229336+03
86	7	Нанесена оценка от защита	Вашата оценка от защитата е 5.75 (Отличен)	success	t	\N	2026-08-14 23:53:14.422391+03
87	7	Нанесена оценка от защита	Вашата оценка от защитата е 5.75 (Отличен)	success	t	\N	2026-08-14 23:55:27.740272+03
88	7	Успешно защитена дипломна работа	Вашата дипломна работа е маркирана като успешно защитена.	success	t	\N	2026-08-14 23:57:28.769705+03
89	7	Нанесена оценка от защита	Вашата оценка от защитата е 5.75 (Отличен)	success	t	\N	2026-08-14 23:57:46.313353+03
90	7	Успешно защитена дипломна работа	Вашата дипломна работа е маркирана като успешно защитена.	success	t	\N	2026-08-15 00:08:35.318367+03
91	7	Нанесена оценка от защита	Вашата оценка от защитата е 5.75 (Отличен)	success	t	\N	2026-08-15 00:08:43.584252+03
40	7	Премахнати сте от комисия	Комисия II е изтрита и вие сте премахнати от нея.	warning	t	\N	2026-08-13 23:22:09.536022+03
48	7	Премахнати сте от комисия	Комисия II е изтрита и вие сте премахнати от нея.	warning	t	\N	2026-08-13 23:26:20.76581+03
55	7	Назначени сте към комисия	Назначени сте към Комисия II	info	t	\N	2026-08-13 23:26:57.807283+03
56	7	Премахнати сте от комисия	Комисия II е изтрита и вие сте премахнати от нея.	warning	t	\N	2026-08-13 23:29:33.894434+03
63	7	Назначени сте към комисия	Назначени сте към Комисия II	info	t	\N	2026-08-13 23:31:09.722175+03
73	7	Насрочена защита	Добавени сте към защита "Защита 1" на 16.08.2026 г. в зала 2103	info	t	\N	2026-08-14 00:28:38.283455+03
74	7	Насрочена защита	Добавени сте към защита "Защита 1" на 16.08.2026 г. в зала 2103	info	t	\N	2026-08-14 00:31:00.018709+03
75	7	Успешно защитена дипломна работа	Вашата дипломна работа е маркирана като успешно защитена.	success	t	\N	2026-08-14 23:19:00.005126+03
76	7	Успешно защитена дипломна работа	Вашата дипломна работа е маркирана като успешно защитена.	success	t	\N	2026-08-14 23:19:04.380029+03
77	7	Успешно защитена дипломна работа	Вашата дипломна работа е маркирана като успешно защитена.	success	t	\N	2026-08-14 23:24:08.946761+03
92	7	Нанесена оценка от защита	Вашата оценка от защитата е 5.50 (Отличен)	success	t	\N	2026-08-15 00:11:59.517357+03
93	7	Успешно защитена дипломна работа	Вашата дипломна работа е маркирана като успешно защитена.	success	t	\N	2026-08-17 14:13:07.100427+03
94	7	Нанесена оценка от защита	Вашата оценка от защитата е 6.00 (Отличен)	success	t	\N	2026-08-17 14:13:10.379493+03
95	7	Нанесена оценка от защита	Вашата оценка от защитата е 6.00 (Отличен)	success	t	\N	2026-08-17 14:20:05.127996+03
96	7	Успешно защитена дипломна работа	Вашата дипломна работа е маркирана като успешно защитена.	success	t	\N	2026-08-17 14:28:28.80878+03
97	7	Нанесена оценка от защита	Вашата оценка от защитата е 6.00 (Отличен)	success	t	\N	2026-08-17 14:28:29.949058+03
98	7	Успешно защитена дипломна работа	Вашата дипломна работа е маркирана като успешно защитена.	success	t	\N	2026-08-17 14:33:12.320103+03
99	7	Нанесена оценка от защита	Вашата оценка от защитата е 5.75 (Отличен)	success	t	\N	2026-08-17 14:33:14.568067+03
100	9	Защита изтрита	Защитата "Защита 2" е изтрита.	warning	f	\N	2026-08-17 21:59:27.07838+03
102	11	Защита изтрита	Защитата "Защита 2" е изтрита.	warning	f	\N	2026-08-17 21:59:27.081707+03
103	6	Защита изтрита	Защитата "Защита 2" е изтрита.	warning	f	\N	2026-08-17 21:59:27.082421+03
104	5	Защита изтрита	Защитата "Защита 2" е изтрита.	warning	f	\N	2026-08-17 21:59:27.083122+03
105	9	Комисия изтрита	Комисия I е изтрита.	warning	f	\N	2026-08-17 21:59:52.377498+03
107	11	Комисия изтрита	Комисия I е изтрита.	warning	f	\N	2026-08-17 21:59:52.380064+03
108	6	Комисия изтрита	Комисия I е изтрита.	warning	f	\N	2026-08-17 21:59:52.381065+03
109	5	Комисия изтрита	Комисия I е изтрита.	warning	f	\N	2026-08-17 21:59:52.382143+03
111	17	Запитването е отхвърлено	За съжаление запитването ви за "Автоматизация на журнала" е отхвърлено.	warning	t	\N	2026-08-17 22:34:44.530563+03
113	17	Запитването е одобрено!	Вашето запитване за ръководство на "Автоматизация на журнала" е одобрено!	success	f	\N	2026-08-17 22:36:51.328921+03
115	17	Дипломната работа е върната за корекции	Бъди по-конкретна	warning	f	4	2026-08-17 22:43:02.960459+03
112	12	Ново запитване за ръководство	Студент иска да бъдете негов ръководител за: "Автоматизация на журнала"	info	t	\N	2026-08-17 22:36:27.573073+03
114	12	Нова подадена дипломна работа	Студент е предал своята дипломна работа: "Автоматизация на журнала"	info	t	4	2026-08-17 22:42:11.040192+03
116	12	Нова подадена дипломна работа	Студент е предал своята дипломна работа: "Автоматизация на журнала"	info	t	4	2026-08-17 22:43:33.490654+03
117	18	Ново запитване за ръководство	Студент иска да бъдете негов ръководител за: "GPS system"	info	f	\N	2026-08-17 22:48:01.32565+03
118	21	Запитването е одобрено!	Вашето запитване за ръководство на "GPS system" е одобрено!	success	f	\N	2026-08-17 22:49:09.274924+03
119	18	Нова подадена дипломна работа	Студент е предал своята дипломна работа: "GPS system"	info	f	5	2026-08-17 22:50:48.874199+03
121	28	Запитването е одобрено!	Вашето запитване за ръководство на "Болнична система" е одобрено!	success	t	\N	2026-08-24 15:28:55.01394+03
123	28	Дипломната работа е одобрена	Научният ръководител одобри "Болнична система"	success	f	6	2026-08-24 15:35:24.783381+03
124	12	Назначени сте за рецензент	Назначени сте за рецензент на "Болнична система"	info	f	6	2026-08-24 15:35:25.117421+03
125	28	Дипломната работа е изпратена за рецензия	"Болнична система" е изпратена за рецензия	info	f	6	2026-08-24 15:35:25.11884+03
126	28	Рецензията е готова	Вашата дипломна работа "Болнична система" получи рецензия.	info	f	6	2026-08-24 15:44:29.976148+03
130	9	Комисия изтрита	Комисия II е изтрита.	warning	f	\N	2026-08-24 17:55:47.207368+03
131	11	Комисия изтрита	Комисия II е изтрита.	warning	f	\N	2026-08-24 17:55:47.208089+03
132	12	Комисия изтрита	Комисия II е изтрита.	warning	f	\N	2026-08-24 17:55:47.208696+03
133	22	Ново запитване за ръководство	Студент иска да бъдете негов ръководител за: "Проектиране на авиционната организация"	info	t	\N	2026-08-24 18:02:19.066995+03
135	22	Нова подадена дипломна работа	Студент е предал своята дипломна работа: "Проектиранe на авиционна организация"	info	f	7	2026-08-24 18:04:43.456791+03
129	2	Комисия изтрита	Комисия II е изтрита.	warning	t	\N	2026-08-24 17:55:47.206516+03
128	7	Премахнати сте от комисия	Комисия II е изтрита и вие сте премахнати от нея.	warning	t	\N	2026-08-24 17:55:47.20272+03
110	15	Ново запитване за ръководство	Студент иска да бъдете негов ръководител за: "Автоматизация на журнала"	info	t	\N	2026-08-17 22:34:16.324175+03
137	15	Назначени сте за рецензент	Назначени сте за рецензент на "Проектиранe на авиционна организация"	info	t	7	2026-08-24 18:05:12.831514+03
140	22	Рецензията е изготвена	Рецензията на "Проектиранe на авиционна организация" е готова.	info	f	7	2026-08-24 18:07:33.258594+03
134	51	Запитването е одобрено!	Вашето запитване за ръководство на "Проектиране на авиционната организация" е одобрено!	success	t	\N	2026-08-24 18:02:43.438032+03
136	51	Дипломната работа е одобрена	Научният ръководител одобри "Проектиранe на авиционна организация"	success	t	7	2026-08-24 18:05:12.4997+03
138	51	Дипломната работа е изпратена за рецензия	"Проектиранe на авиционна организация" е изпратена за рецензия	info	t	7	2026-08-24 18:05:12.832442+03
139	51	Рецензията е готова	Вашата дипломна работа "Проектиранe на авиционна организация" получи рецензия.	info	t	7	2026-08-24 18:07:33.25699+03
141	9	Добавени сте към комисия	Добавени сте като член на Комисия I	info	f	\N	2026-08-24 22:54:24.030263+03
142	6	Добавени сте към комисия	Добавени сте като член на Комисия I	info	f	\N	2026-08-24 22:54:24.354321+03
143	60	Добавени сте към комисия	Добавени сте като член на Комисия I	info	f	\N	2026-08-24 22:54:24.675369+03
144	62	Добавени сте към комисия	Добавени сте като член на Комисия I	info	f	\N	2026-08-24 22:54:25.005466+03
145	56	Добавени сте към комисия	Добавени сте като член на Комисия I	info	f	\N	2026-08-24 22:54:25.324541+03
146	60	Добавени сте към комисия	Добавени сте като председател на Комисия I	info	f	\N	2026-08-24 22:54:29.986615+03
147	51	Допуснати сте до защита!	"Проектиранe на авиционна организация" е допусната до защита	success	f	7	2026-08-24 23:06:49.505523+03
148	51	Насрочена защита	Добавени сте към защита "Защита 1" на 25.08.2026 г. в зала 3101	info	f	\N	2026-08-24 23:06:59.023802+03
149	51	Защита изтрита	Защитата "Защита 1" е изтрита.	warning	f	\N	2026-08-24 23:10:40.747386+03
150	9	Защита изтрита	Защитата "Защита 1" е изтрита.	warning	f	\N	2026-08-24 23:10:40.751052+03
151	6	Защита изтрита	Защитата "Защита 1" е изтрита.	warning	f	\N	2026-08-24 23:10:40.752163+03
152	62	Защита изтрита	Защитата "Защита 1" е изтрита.	warning	f	\N	2026-08-24 23:10:40.753473+03
153	56	Защита изтрита	Защитата "Защита 1" е изтрита.	warning	f	\N	2026-08-24 23:10:40.754696+03
154	60	Защита изтрита	Защитата "Защита 1" е изтрита.	warning	f	\N	2026-08-24 23:10:40.755451+03
155	51	Статус променен	Статусът на "Проектиранe на авиционна организация" е променен на: approved_for_defense	info	f	7	2026-08-24 23:24:01.533781+03
156	51	Насрочена защита	Добавени сте към защита "Защита 2" на 25.08.2026 г. в зала 3101	info	f	\N	2026-08-24 23:24:17.207319+03
157	51	Успешно защитена дипломна работа	Вашата дипломна работа е маркирана като успешно защитена.	success	f	\N	2026-08-25 13:50:01.494418+03
158	51	Нанесена оценка от защита	Вашата оценка от защитата е 5.50 (Отличен)	success	f	\N	2026-08-25 13:50:05.607151+03
\.


--
-- Data for Name: reviews; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.reviews (id, thesis_id, reviewer_id, content, file_url, recommendation, is_published, created_at, updated_at) FROM stdin;
1	2	5	Рецензия за автомобили.	/uploads/reviews/1786561673281-571313693.docx	approve	t	2026-08-12 22:07:53.414032+03	2026-08-12 22:07:53.414032+03
2	6	12	Прикачвам рецензията на Елена Николова.	/uploads/reviews/1787575469926-749496457.pdf	approve	t	2026-08-24 15:44:29.931066+03	2026-08-24 15:44:29.931066+03
3	7	15	Рецензия на дипломната работа	/uploads/reviews/1787584053247-108543511.docx	approve	t	2026-08-24 18:07:33.254383+03	2026-08-24 18:07:33.254383+03
\.


--
-- Data for Name: student_committees; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.student_committees (id, student_id, committee_id, assigned_at) FROM stdin;
\.


--
-- Data for Name: supervisor_requests; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.supervisor_requests (id, student_id, supervisor_id, thesis_title, technologies, description, status, reviewer_id, created_at, updated_at) FROM stdin;
1	1	6	Автоматизация на болничния процес	React, Node.JS	Автоматизация на болничния процес	accepted	\N	2026-08-12 18:40:30.222973+03	2026-08-12 18:50:33.279+03
2	7	6	Сайт за автомобили	HTML, CSS	Сайт за автомобили	accepted	\N	2026-08-12 21:41:04.116316+03	2026-08-12 21:42:13.069+03
4	17	15	Автоматизация на журнала	React, Java	Целта на проекта е да се автоматизират процесите на пресата.	rejected	\N	2026-08-17 22:34:16.314713+03	2026-08-17 22:34:44.528+03
5	17	12	Автоматизация на журнала	Java, React	Целта на проекта е да се автоматизира процеса на журнала.	accepted	\N	2026-08-17 22:36:27.571262+03	2026-08-17 22:36:51.326+03
6	21	18	GPS system	MySQL, C++	GPS system	accepted	\N	2026-08-17 22:48:01.322275+03	2026-08-17 22:49:09.272+03
8	51	22	Проектиране на авиционната организация	Java, PostgreSQL	Проектиране на авиционната организация	accepted	\N	2026-08-24 18:02:19.064097+03	2026-08-24 18:02:43.431+03
\.


--
-- Data for Name: theses; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.theses (id, title, description, status, student_id, supervisor_id, reviewer_id, reviewer_selected_at, defense_id, keywords, field, submitted_at, created_at, updated_at, final_grade, grade_calculated_at) FROM stdin;
4	Автоматизация на журнала	Целта на проекта е да се автоматизира процеса.	submitted	17	12	\N	\N	\N	React, Java	Уеб	2026-08-17 22:43:33.487+03	2026-08-17 22:41:35.887075+03	2026-08-17 22:43:33.487+03	\N	\N
1	Автоматизация на болничния процес	Автоматизация на болничния процес	approved_by_supervisor	1	6	\N	\N	\N	React, JS	Уеб технология	2026-08-12 19:10:59.903+03	2026-08-12 18:01:27.709063+03	2026-08-12 19:30:04.013+03	\N	\N
5	GPS system	GPS system	submitted	21	18	\N	\N	\N	C++, MySQL	Уеб	2026-08-17 22:50:48.871+03	2026-08-17 22:50:27.301137+03	2026-08-17 22:50:48.871+03	\N	\N
2	Сайт за автомоболи		graded	7	6	5	2026-08-12 21:48:43.331+03	\N	HTML, CSS	Уеб технологии	2026-08-12 21:43:28.269+03	2026-08-12 21:37:37.434093+03	2026-08-17 14:33:14.571+03	\N	\N
3	Автоматизация на журнала		draft	17	12	\N	\N	\N	React, Java	Уеб	\N	2026-08-17 22:37:47.492461+03	2026-08-17 22:37:47.492461+03	\N	\N
6	Болнична система	Болнична система\n	reviewed	28	15	12	2026-08-24 15:35:25.114+03	\N		Уеб	2026-08-24 15:30:33.551+03	2026-08-24 15:29:44.53188+03	2026-08-24 15:44:29.971+03	\N	\N
7	Проектиранe на авиционна организация	Проектиранe на авиционна организация	graded	51	22	15	2026-08-24 18:05:12.828+03	\N	Java, PostgreSQL	Уеб	2026-08-24 18:04:43.449+03	2026-08-24 18:04:06.79036+03	2026-08-25 13:50:05.609+03	\N	\N
\.


--
-- Data for Name: thesis_files; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.thesis_files (id, thesis_id, file_name, file_url, file_type, file_size, uploaded_by, created_at) FROM stdin;
2	1	ÐÑÐ¸Ð¼ÐµÑÐ½Ð° ÑÑÑÑÐºÑÑÑÐ° - Ð¿ÑÐ¾ÐµÐºÑ ÐÐÐ.docx	/uploads/1786547316947-297039058.docx	application/vnd.openxmlformats-officedocument.wordprocessingml.document	106169	1	2026-08-12 18:08:36.96559+03
3	2	Примерна структура - проект НБД.docx	/uploads/1786559882632-824334793.docx	application/vnd.openxmlformats-officedocument.wordprocessingml.document	106169	7	2026-08-12 21:38:02.648112+03
4	3	документация.docx	/uploads/1786995563359-174465835.docx	application/vnd.openxmlformats-officedocument.wordprocessingml.document	13477	17	2026-08-17 22:39:23.379708+03
6	4	документация.docx	/uploads/1786995808587-106294981.docx	application/vnd.openxmlformats-officedocument.wordprocessingml.document	13477	17	2026-08-17 22:43:28.588913+03
7	5	документация.docx	/uploads/1786996245335-205542917.docx	application/vnd.openxmlformats-officedocument.wordprocessingml.document	13477	21	2026-08-17 22:50:45.337862+03
8	6	протокол-Защита 1.pdf	/uploads/1787574626833-782579344.pdf	application/pdf	4505	28	2026-08-24 15:30:26.844016+03
9	7	документация.docx	/uploads/1787583872983-326157114.docx	application/vnd.openxmlformats-officedocument.wordprocessingml.document	13477	51	2026-08-24 18:04:32.994222+03
\.


--
-- Data for Name: users; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.users (id, email, password_hash, first_name, last_name, role, faculty, department, phone_number, avatar_url, faculty_number, subject_taught, max_students, created_at, updated_at, specialty, degree, reset_token, reset_token_expiry) FROM stdin;
1	kgeorgieva@uni.bg	1d06cc9e21c08231cfb41a1ed7787e83412f72c831e5b8ca042175b332e654f1	Катя	Георгиева	student	Факултет по телекомуникации (ФТК)	\N	\N	\N	301222033	\N	40	2026-08-09 17:59:13.902607+03	2026-08-17 22:19:54.201+03	Телекомуникации	bachelor	\N	\N
21	yenev@uni.bg	3fff122b73243d61d523de678c131fda15d91bd84b968eb23fbca636dab8a814	Йоан	Енев	student	Факултет по телекомуникации (ФТК)	\N	\N	\N	301222098	\N	40	2026-08-17 22:21:00.163236+03	2026-08-17 22:21:00.163236+03	Телекомуникации	bachelor	\N	\N
4	iangelov@uni.bg	bb3dbd297b3427e51b02dcecaa75f0e8de1968f2653baaa6c2dfb69779dcc932	Ivo	Angelov	admin			0891345679	\N	\N	\N	40	2026-08-09 18:03:51.131588+03	2026-08-17 13:22:49.834+03	\N	\N	\N	\N
7	itodorov@uni.bg	5fd56104297a82c0a6b396e2e7e4b8b31840e076eb6a2f39ab93bd1051629ad6	Иван	Тодоров	student	Факултет „Компютърни системи и технологии" (ФКСТ)	\N	\N	\N	121222179	\N	40	2026-08-12 21:37:08.236964+03	2026-08-17 22:19:36.107+03	Компютърно и софтуерно инженерство	bachelor	\N	\N
16	mdobrev@uni.bg	48ec13282aa66230b1385107190b0c8f1626ce42e5431c6908857208f5d816c9	Михаил	Добрев	student	Факултет „Компютърни системи и технологии" (ФКСТ)	\N	\N	\N	131222034	\N	40	2026-08-17 21:40:36.401779+03	2026-08-17 22:20:00.082+03	Киберсигурност	bachelor	\N	\N
17	rstoimenova@uni.bg	85e8fba662c596eb7a38571655b058447e00b16e294c7199946cda756213877a	Ралица	Стоименова	student	Факултет „Компютърни системи и технологии" (ФКСТ)	\N	\N	\N	131222056	\N	40	2026-08-17 21:41:16.451295+03	2026-08-17 21:41:16.451295+03	Информационни технологии в индустрията	bachelor	\N	\N
15	dkolev@uni.bg	0aabae73e31b09aa0329a9d8b6af322c3463af510b994de23d78c4f0601b88c8	Добромир	Колев	department_head	Факултет „Компютърни системи и технологии" (ФКСТ)	Програмиране и компютърни технологии	\N	\N	\N	\N	10	2026-08-17 21:35:59.205435+03	2026-08-17 22:10:54.973+03	\N	\N	\N	\N
5	masenova@uni.bg	4b418df1a968db29f995c987d52aafdd5b3cfdb332ce5fd682568cd915cbf035	Мария	Асенова	supervisor	Факултет „Електронна техника и технологии" (ФЕТТ)	Силова електроника	\N	\N	\N	МИ	10	2026-08-09 18:08:14.118415+03	2026-08-17 22:21:44.105+03	\N	\N	\N	\N
2	iivanova@uni.bg	9d95a4d77b7829b950f99751c7b296c48dd7dbf7acf7a68c7a002e0b51fd2955	Ива	Иванова	department_head	Факултет по транспорта (ФТ)	Въздушен транспорт	\N	\N	\N	\N	10	2026-08-09 18:00:05.464964+03	2026-08-17 22:12:32.861+03	\N	\N	\N	\N
9	syordanov@uni.bg	655fbed07407132500c90571b5ec7b1edadf12fcc7aedd78a73eb4f674c92912	Станислав	Йорданов	supervisor	Факултет „Електронна техника и технологии" (ФЕТТ)	Електронна техника	\N	\N	\N	ИКС	10	2026-08-13 19:45:43.367694+03	2026-08-17 22:11:26.739+03	\N	\N	\N	\N
11	tbozhilov@uni.bg	2fcde602af2919866d703b5d31244af88173408cb99accd50938beaca87609b5	Тодор	Божилов	supervisor	Факултет по телекомуникации (ФТК)	Телекомуникационни мрежи	\N	\N	\N	Математика	10	2026-08-13 22:21:00.670474+03	2026-08-17 22:11:59.105+03	\N	\N	\N	\N
22	dpetrova@uni.bg	ab8e5f941972f7a3537e8bd93c81194960028f830cd76b43193f1e4577030958	Добромира	Петрова	supervisor	Факултет по транспорта (ФТ)	Двигатели, автомобилна техника и транспорт	\N	\N	\N	\N	10	2026-08-17 22:22:33.994932+03	2026-08-17 22:22:33.994932+03	\N	\N	\N	\N
6	givanov@uni.bg	d879515e3bb5a9c867d4651de66cfa29fc2800eacd7758922e9050e9e7658128	Георги	Иванов	supervisor	Факултет „Компютърни системи и технологии" (ФКСТ)	Интелигентни технологии в индустрията	\N	\N	001212012	\N	10	2026-08-09 18:44:34.423248+03	2026-08-17 22:14:06.636+03	\N	\N	zwpsmnttxjmsw0942o	2026-08-16 20:14:18.336+03
18	zhristova@uni.bg	17b15651b41bb9e957f951962219ab602df65df554f5addae577db0c395c901b	Зорница	Христова	department_head	Факултет по телекомуникации (ФТК)	Телекомуникационни мрежи	\N	\N	\N	\N	10	2026-08-17 22:15:16.556426+03	2026-08-17 22:15:16.556426+03	\N	\N	\N	\N
19	gantov@uni.bg	1b4dd4fb0267dc3189c58bcaea46102b9fd6641ab44fe5a3a7f15220adf9672c	Габриел	Антов	department_head	Факултет „Електронна техника и технологии" (ФЕТТ)	Микроелектроника	\N	\N	\N	\N	10	2026-08-17 22:16:59.241809+03	2026-08-17 22:16:59.241809+03	\N	\N	\N	\N
12	ntsanev@uni.bg	ead36637669c81e077453a6a8d8ef739c7a54447d3f4b66b78704d9bdbcbd272	Николай	Цанев	supervisor	Факултет „Компютърни системи и технологии" (ФКСТ)	Киберсигурност	\N	\N	\N	ИИ	10	2026-08-13 23:04:14.075837+03	2026-08-17 22:10:24.141+03	\N	\N	\N	\N
23	apetrov@uni.bg	42a34d0518b62dd1fe365e4a208e1cada081c8d103465e6ef46e71271a170b96	Александър	Петров	student	Факултет „Компютърни системи и технологии" (ФКСТ)	\N	\N	\N	121222001	\N	10	2026-08-24 15:06:34.940866+03	2026-08-24 15:06:34.940866+03	Компютърно и софтуерно инженерство	bachelor	\N	\N
60	tteodorova@uni.bg	4fe55e88cdde82a49254d7439089510ecccae04299d13b1d3681bb154384fa82	Теодора	Теодорова	department_head	Факултет „Компютърни системи и технологии" (ФКСТ)	Киберсигурност	\N	\N	\N	\N	10	2026-08-24 15:12:19.640155+03	2026-08-24 15:12:19.640155+03	\N	\N	\N	\N
24	bivanova@uni.bg	9d95a4d77b7829b950f99751c7b296c48dd7dbf7acf7a68c7a002e0b51fd2955	Биляна	Иванова	student	Факултет „Компютърни системи и технологии" (ФКСТ)	\N	\N	\N	121222002	\N	10	2026-08-24 15:06:34.956361+03	2026-08-24 15:06:34.956361+03	Компютърно и софтуерно инженерство	bachelor	\N	\N
25	vgeorgieva@uni.bg	1d06cc9e21c08231cfb41a1ed7787e83412f72c831e5b8ca042175b332e654f1	Виктория	Георгиева	student	Факултет „Компютърни системи и технологии" (ФКСТ)	\N	\N	\N	121222003	\N	10	2026-08-24 15:06:34.95735+03	2026-08-24 15:06:34.95735+03	Компютърно и софтуерно инженерство	bachelor	\N	\N
26	gdimitrov@uni.bg	bbbbc55f5bdf11b1979bbed2174c9a5903b2c651a965b2a4d5d83ba88bdcd358	Георги	Димитров	student	Факултет „Компютърни системи и технологии" (ФКСТ)	\N	\N	\N	121222011	\N	10	2026-08-24 15:06:34.957962+03	2026-08-24 15:06:34.957962+03	Компютърни системи и информационни технологии	bachelor	\N	\N
27	dstoyanova@uni.bg	a401676e14d8e1a8f53acd6e70607cceef270f8f7c155b943e7889ba11b818fc	Десислава	Стоянова	student	Факултет „Компютърни системи и технологии" (ФКСТ)	\N	\N	\N	121222012	\N	10	2026-08-24 15:06:34.958938+03	2026-08-24 15:06:34.958938+03	Компютърни системи и информационни технологии	bachelor	\N	\N
28	enikolova@uni.bg	c5b0bf7465748205144a25e5e960b12ee56596bb5fa61d1434dfdfc810e2ce42	Елена	Николова	student	Факултет „Компютърни системи и технологии" (ФКСТ)	\N	\N	\N	121222013	\N	10	2026-08-24 15:06:34.959431+03	2026-08-24 15:06:34.959431+03	Компютърни системи и информационни технологии	bachelor	\N	\N
29	ztodorov@uni.bg	5fd56104297a82c0a6b396e2e7e4b8b31840e076eb6a2f39ab93bd1051629ad6	Захари	Тодоров	student	Факултет „Компютърни системи и технологии" (ФКСТ)	\N	\N	\N	131222001	\N	10	2026-08-24 15:06:34.959907+03	2026-08-24 15:06:34.959907+03	Киберсигурност	bachelor	\N	\N
30	ihristova@uni.bg	17b15651b41bb9e957f951962219ab602df65df554f5addae577db0c395c901b	Ивета	Христова	student	Факултет „Компютърни системи и технологии" (ФКСТ)	\N	\N	\N	131222002	\N	10	2026-08-24 15:06:34.960514+03	2026-08-24 15:06:34.960514+03	Киберсигурност	bachelor	\N	\N
59	kkrasimirov@uni.bg	e4f517bbb5021be9f24d1f1b21f536bd93165bb3facf0c43176d1046482e0ef1	Красен	Красимиров	department_head	Факултет „Компютърни системи и технологии" (ФКСТ)	Компютърни системи	\N	\N	\N	\N	10	2026-08-24 15:12:19.6396+03	2026-08-24 19:06:56.42+03	\N	\N	\N	\N
61	vvencisolavov@uni.bg	91ec8ce571791da11f40810de6c1a83618fa17e56fabd8977c8a65bdd7dd07a5	Веселин	Венциславов	department_head	Факултет „Компютърни системи и технологии" (ФКСТ)	Интелигентни технологии в индустрията	\N	\N	\N	\N	10	2026-08-24 15:12:19.640774+03	2026-08-24 19:07:59.818+03	\N	\N	\N	\N
56	sstefanov@uni.bg	eaf2a5fb2c3e67b947076e1d9b351267a606f3efc7c8a60742c1bf63431bca51	Стефан	Стоянов	department_head	Факултет „Електронна техника и технологии" (ФЕТТ)	Силова електроника	\N	\N	\N	\N	10	2026-08-24 15:12:19.621533+03	2026-08-24 19:06:39.003+03	\N	\N	\N	\N
62	mmilenovа@uni.bg	876de31a7a976333784b94f8091379be6ea965248e80404614b1bdd5a87b0d4b	Михаела	Миленова	department_head	Факултет „Електронна техника и технологии" (ФЕТТ)	Електронна техника	\N	\N	\N	\N	10	2026-08-24 15:12:19.641235+03	2026-08-24 19:07:36.791+03	\N	\N	\N	\N
57	rradkova@uni.bg	d99d038a30dea23345cce63fc81a8010187975f33f13b9f004981714aa6ee27a	Радост	Радкова	department_head	Факултет по телекомуникации (ФТК)	Радиокомуникации и видеотехнологии	\N	\N	\N	\N	10	2026-08-24 15:12:19.637931+03	2026-08-24 19:08:57.585+03	\N	\N	\N	\N
55	opetrovt@uni.bg	42a34d0518b62dd1fe365e4a208e1cada081c8d103465e6ef46e71271a170b96	Огнян	Петров	student	Факултет по транспорта (ФТ)	\N	\N	\N	901222013	\N	10	2026-08-24 15:06:34.975196+03	2026-08-24 15:06:34.975196+03	Транспортна техника и технологии	bachelor	\N	\N
63	ssvetoslavov@uni.bg	333ead9fb5d38f9d12f150d37c04730012ff79345c609e1706a817892e421e22	Свилен	Светославов	department_head	Факултет по транспорта (ФТ)	Железопътна техника и технологии	\N	\N	\N	\N	10	2026-08-24 15:12:19.641933+03	2026-08-24 19:07:11.206+03	\N	\N	\N	\N
31	kmarinov@uni.bg	3348cc679a4d5495c0201dc1bf83ac1cb24703a9b1d31edf72aa26d682287a32	Калоян	Маринов	student	Факултет „Компютърни системи и технологии" (ФКСТ)	\N	\N	\N	131222003	\N	10	2026-08-24 15:06:34.961959+03	2026-08-24 15:06:34.961959+03	Киберсигурност	bachelor	\N	\N
32	latanasov@uni.bg	85f6122686ea06bbe58d8f2c399acf40367eee7a244e560d713636f1076f58a3	Любомир	Атанасов	student	Факултет „Компютърни системи и технологии" (ФКСТ)	\N	\N	\N	131222011	\N	10	2026-08-24 15:06:34.96267+03	2026-08-24 15:06:34.96267+03	Информационни технологии в индустрията	bachelor	\N	\N
33	mpopova@uni.bg	946aab02a1c16039935424fd3fa66113ace0785c4b772bd5928a533aca059dba	Мартина	Попова	student	Факултет „Компютърни системи и технологии" (ФКСТ)	\N	\N	\N	131222012	\N	10	2026-08-24 15:06:34.963409+03	2026-08-24 15:06:34.963409+03	Информационни технологии в индустрията	bachelor	\N	\N
34	nkolev@uni.bg	0aabae73e31b09aa0329a9d8b6af322c3463af510b994de23d78c4f0601b88c8	Никола	Колев	student	Факултет „Компютърни системи и технологии" (ФКСТ)	\N	\N	\N	131222013	\N	10	2026-08-24 15:06:34.964354+03	2026-08-24 15:06:34.964354+03	Информационни технологии в индустрията	bachelor	\N	\N
35	omihaylova@uni.bg	594a5a8ba80a5f6e38fe6feee28002fe4450e37c316366b55a53bcfbd6129e93	Огняна	Михайлова	student	Факултет „Електронна техника и технологии" (ФЕТТ)	\N	\N	\N	221222001	\N	10	2026-08-24 15:06:34.966019+03	2026-08-24 15:06:34.966019+03	Електронни информационни системи	bachelor	\N	\N
36	pstefanova@uni.bg	8ed16ec60fd929f06bddcebcbe925078c5decb0bec17ccc201f55906c8a7ea2c	Петя	Стефанова	student	Факултет „Електронна техника и технологии" (ФЕТТ)	\N	\N	\N	221222002	\N	10	2026-08-24 15:06:34.966835+03	2026-08-24 15:06:34.966835+03	Електронни информационни системи	bachelor	\N	\N
37	riliev@uni.bg	d65091a63b3369f4f53ac4b4094bea105089515a86619b1d655a808f186d7bc0	Радослав	Илиев	student	Факултет „Електронна техника и технологии" (ФЕТТ)	\N	\N	\N	221222003	\N	10	2026-08-24 15:06:34.967244+03	2026-08-24 15:06:34.967244+03	Електронни информационни системи	bachelor	\N	\N
38	svasileva@uni.bg	5da1a69cecfc5f8a29a1d56737fd50b58f25681c27c02f95aac2125b423cfbe8	Симона	Василева	student	Факултет „Електронна техника и технологии" (ФЕТТ)	\N	\N	\N	201222001	\N	10	2026-08-24 15:06:34.967681+03	2026-08-24 15:06:34.967681+03	Микро- и наноелектроника	bachelor	\N	\N
39	tgenov@uni.bg	b27e79f0a3515942b0e476d6a90993fc8a6fc8e904de79412e1ad7d61823010f	Тихомир	Генов	student	Факултет „Електронна техника и технологии" (ФЕТТ)	\N	\N	\N	201222002	\N	10	2026-08-24 15:06:34.968086+03	2026-08-24 15:06:34.968086+03	Микро- и наноелектроника	bachelor	\N	\N
40	umilanova@uni.bg	f1fa1a87bc6e7d020f4831e5d205ff17f0cc7568891b4c752fde9b3d42e5638b	Ули	Миланова	student	Факултет „Електронна техника и технологии" (ФЕТТ)	\N	\N	\N	201222003	\N	10	2026-08-24 15:06:34.968531+03	2026-08-24 15:06:34.968531+03	Микро- и наноелектроника	bachelor	\N	\N
41	fyordanov@uni.bg	655fbed07407132500c90571b5ec7b1edadf12fcc7aedd78a73eb4f674c92912	Филип	Йорданов	student	Факултет „Електронна техника и технологии" (ФЕТТ)	\N	\N	\N	211222001	\N	10	2026-08-24 15:06:34.968932+03	2026-08-24 15:06:34.968932+03	Автомобилна електроника	bachelor	\N	\N
42	hangelova@uni.bg	df5f237a4c922726278a38ab19fff43ff00a9ac0cbc4aeb5d2b0f80fe5cecbfc	Христина	Ангелова	student	Факултет „Електронна техника и технологии" (ФЕТТ)	\N	\N	\N	211222002	\N	10	2026-08-24 15:06:34.96932+03	2026-08-24 15:06:34.96932+03	Автомобилна електроника	bachelor	\N	\N
43	aaleksandrov@uni.bg	8ddf648d18601c1b00b2a5f68163a990f86dee3109d19978d901b918e29c4997	Антон	Александров	student	Факултет „Електронна техника и технологии" (ФЕТТ)	\N	\N	\N	211222003	\N	10	2026-08-24 15:06:34.969614+03	2026-08-24 15:06:34.969614+03	Автомобилна електроника	bachelor	\N	\N
44	bborisov@uni.bg	d7698ef287f45a4c0f65c5535682725406bbc906b4a177560f04e47ea1e9f309	Боян	Борисов	student	Факултет по телекомуникации (ФТК)	\N	\N	\N	301222001	\N	10	2026-08-24 15:06:34.969878+03	2026-08-24 15:06:34.969878+03	Телекомуникации	bachelor	\N	\N
45	vsimeonova@uni.bg	d0baaa549103d6e6733eaee9755d1405f360362bba6695213e1c09db6c60ce1b	Валентина	Симеонова	student	Факултет по телекомуникации (ФТК)	\N	\N	\N	301222002	\N	10	2026-08-24 15:06:34.970113+03	2026-08-24 15:06:34.970113+03	Телекомуникации	bachelor	\N	\N
46	gnachev@uni.bg	5c59ac6f204cc76521d3cf863e65ce707d99d51fdbc67fb7935276574d7f5eca	Галин	Начев	student	Факултет по телекомуникации (ФТК)	\N	\N	\N	301222003	\N	10	2026-08-24 15:06:34.970433+03	2026-08-24 15:06:34.970433+03	Телекомуникации	bachelor	\N	\N
47	dpenchev@uni.bg	df6d8653f26bc9883edfcd9bd280354939f9e7ad117a3547bd15c6f7535799d7	Димитър	Пенчев	student	Факултет по транспорта (ФТ)	\N	\N	\N	901222001	\N	10	2026-08-24 15:06:34.970818+03	2026-08-24 15:06:34.970818+03	Автотранспортна техника	bachelor	\N	\N
48	etaneva@uni.bg	de31a575ed89d9afd8a337e4fb6331d187dc31bf0ed4a78f61b5959e562a8749	Елица	Танева	student	Факултет по транспорта (ФТ)	\N	\N	\N	901222002	\N	10	2026-08-24 15:06:34.9713+03	2026-08-24 15:06:34.9713+03	Технология и управление на транспорта	bachelor	\N	\N
49	zradev@uni.bg	81936fa3d92a9339fa19601f9aff58a604eeb231197c0e6ce7e7e467f489fc76	Живко	Радев	student	Факултет по транспорта (ФТ)	\N	\N	\N	901222003	\N	10	2026-08-24 15:06:34.97173+03	2026-08-24 15:06:34.97173+03	Автотранспортна техника	bachelor	\N	\N
50	ineykov@uni.bg	867bc367982b5555673eced54a2a44e49d5135d54ba7b230eb959affe58f0113	Ивайло	Нейков	student	Факултет по транспорта (ФТ)	\N	\N	\N	911222001	\N	10	2026-08-24 15:06:34.972264+03	2026-08-24 15:06:34.972264+03	Авиационна техника и технологии	bachelor	\N	\N
51	kmaneva@uni.bg	030a253a3caaae02ace088c9a6c27b59d12d3704428bd6b7db4c2315bf64d1aa	Кристина	Манева	student	Факултет по транспорта (ФТ)	\N	\N	\N	911222002	\N	10	2026-08-24 15:06:34.972897+03	2026-08-24 15:06:34.972897+03	Авиационна техника и технологии	bachelor	\N	\N
52	lstanev@uni.bg	238e581c6ac39400ab47ec24eff42f783207ed0b9a22b54050dca393face5fd5	Людмил	Станев	student	Факултет по транспорта (ФТ)	\N	\N	\N	911222003	\N	10	2026-08-24 15:06:34.973457+03	2026-08-24 15:06:34.973457+03	Авиационна техника и технологии	bachelor	\N	\N
53	mborisovt@uni.bg	d7698ef287f45a4c0f65c5535682725406bbc906b4a177560f04e47ea1e9f309	Мирослав	Борисов	student	Факултет по транспорта (ФТ)	\N	\N	\N	901222011	\N	10	2026-08-24 15:06:34.973943+03	2026-08-24 15:06:34.973943+03	Транспортна техника и технологии	bachelor	\N	\N
54	nvasilevat@uni.bg	5da1a69cecfc5f8a29a1d56737fd50b58f25681c27c02f95aac2125b423cfbe8	Надежда	Василева	student	Факултет по транспорта (ФТ)	\N	\N	\N	901222012	\N	10	2026-08-24 15:06:34.974548+03	2026-08-24 15:06:34.974548+03	Транспортна техника и технологии	bachelor	\N	\N
58	pplamenov@uni.bg	15ff20dc1a60945e48d5ea4c05ba8d883fd9a8b0dcff1b5b8de3c23837f9564c	Панайот	Пламенов	department_head	Факултет по транспорта (ФТ)	Двигатели, автомобилна техника и транспорт	\N	\N	\N	\N	10	2026-08-24 15:12:19.638973+03	2026-08-24 19:08:32.13+03	\N	\N	\N	\N
\.


--
-- Name: audit_log_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.audit_log_id_seq', 305, true);


--
-- Name: committee_members_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.committee_members_id_seq', 50, true);


--
-- Name: committees_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.committees_id_seq', 22, true);


--
-- Name: defense_grades_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.defense_grades_id_seq', 15, true);


--
-- Name: defense_students_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.defense_students_id_seq', 1, false);


--
-- Name: defenses_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.defenses_id_seq', 4, true);


--
-- Name: departments_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.departments_id_seq', 12, true);


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

SELECT pg_catalog.setval('public.notifications_id_seq', 158, true);


--
-- Name: reviews_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.reviews_id_seq', 3, true);


--
-- Name: student_committees_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.student_committees_id_seq', 7, true);


--
-- Name: supervisor_requests_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.supervisor_requests_id_seq', 8, true);


--
-- Name: theses_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.theses_id_seq', 7, true);


--
-- Name: thesis_files_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.thesis_files_id_seq', 9, true);


--
-- Name: users_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.users_id_seq', 63, true);


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
-- Name: departments departments_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.departments
    ADD CONSTRAINT departments_pkey PRIMARY KEY (id);


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

\unrestrict GIhIzoxXKcFP0ab6wlYEM2pHfVFueEysJvAEfFHuvzfXMWFDTWWOTplDqMK5D2m

