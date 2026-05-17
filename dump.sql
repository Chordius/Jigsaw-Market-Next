--
-- PostgreSQL database dump
--

\restrict LiC0XVzHzDDmsiOprKoJVYvxK29BGHtlfIOoelqOS0pbIK3uxADizovQrjCbCfo

-- Dumped from database version 17.8 (9c8634e)
-- Dumped by pg_dump version 18.2

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

--
-- Name: uuid-ossp; Type: EXTENSION; Schema: -; Owner: -
--

CREATE EXTENSION IF NOT EXISTS "uuid-ossp" WITH SCHEMA public;


--
-- Name: EXTENSION "uuid-ossp"; Type: COMMENT; Schema: -; Owner: 
--

COMMENT ON EXTENSION "uuid-ossp" IS 'generate universally unique identifiers (UUIDs)';


SET default_tablespace = '';

SET default_table_access_method = heap;

--
-- Name: comments; Type: TABLE; Schema: public; Owner: neondb_owner
--

CREATE TABLE public.comments (
    id uuid DEFAULT public.uuid_generate_v4() NOT NULL,
    local_user_id uuid,
    market_id uuid,
    content text NOT NULL,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP
);


ALTER TABLE public.comments OWNER TO neondb_owner;

--
-- Name: holdings; Type: TABLE; Schema: public; Owner: neondb_owner
--

CREATE TABLE public.holdings (
    id uuid DEFAULT public.uuid_generate_v4() NOT NULL,
    local_user_id uuid,
    market_id uuid,
    outcome_type character varying(10),
    shares_amount numeric(15,2) DEFAULT 0.00,
    average_buy_price numeric(5,2) DEFAULT 0.00,
    CONSTRAINT holdings_outcome_type_check CHECK (((outcome_type)::text = ANY ((ARRAY['YES'::character varying, 'NO'::character varying])::text[])))
);


ALTER TABLE public.holdings OWNER TO neondb_owner;

--
-- Name: local_orders; Type: TABLE; Schema: public; Owner: neondb_owner
--

CREATE TABLE public.local_orders (
    id uuid DEFAULT public.uuid_generate_v4() NOT NULL,
    local_user_id uuid,
    market_id uuid,
    order_type character varying(10),
    outcome_type character varying(10),
    total_cost numeric(15,2) NOT NULL,
    central_transaction_id uuid NOT NULL,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    shares_amount numeric(15,2) DEFAULT 0,
    price_at_order numeric(15,2) DEFAULT 0,
    CONSTRAINT local_orders_order_type_check CHECK (((order_type)::text = ANY ((ARRAY['BUY'::character varying, 'SELL'::character varying])::text[]))),
    CONSTRAINT local_orders_outcome_type_check CHECK (((outcome_type)::text = ANY ((ARRAY['YES'::character varying, 'NO'::character varying])::text[])))
);


ALTER TABLE public.local_orders OWNER TO neondb_owner;

--
-- Name: local_users; Type: TABLE; Schema: public; Owner: neondb_owner
--

CREATE TABLE public.local_users (
    id uuid DEFAULT public.uuid_generate_v4() NOT NULL,
    central_user_id uuid NOT NULL,
    username character varying(50) NOT NULL,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    email character varying(255) NOT NULL,
    last_login_reward date,
    is_admin boolean DEFAULT false
);


ALTER TABLE public.local_users OWNER TO neondb_owner;

--
-- Name: market_settlements; Type: TABLE; Schema: public; Owner: neondb_owner
--

CREATE TABLE public.market_settlements (
    id uuid DEFAULT public.uuid_generate_v4() NOT NULL,
    market_id uuid,
    resolved_outcome character varying(10) NOT NULL,
    status character varying(30) DEFAULT 'PENDING_PAYOUT'::character varying NOT NULL,
    resolved_by character varying(100),
    resolved_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT market_settlements_resolved_outcome_check CHECK (((resolved_outcome)::text = ANY ((ARRAY['YES'::character varying, 'NO'::character varying])::text[]))),
    CONSTRAINT market_settlements_status_check CHECK (((status)::text = ANY ((ARRAY['PENDING_PAYOUT'::character varying, 'COMPLETED'::character varying, 'PARTIAL_FAILED'::character varying])::text[])))
);


ALTER TABLE public.market_settlements OWNER TO neondb_owner;

--
-- Name: markets; Type: TABLE; Schema: public; Owner: neondb_owner
--

CREATE TABLE public.markets (
    id uuid DEFAULT public.uuid_generate_v4() NOT NULL,
    title character varying(255) NOT NULL,
    category character varying(50) NOT NULL,
    liquidity_yes numeric(15,2) DEFAULT 100.00,
    liquidity_no numeric(15,2) DEFAULT 100.00,
    end_date timestamp without time zone NOT NULL,
    status character varying(20) DEFAULT 'OPEN'::character varying,
    resolved_outcome character varying(10),
    description text,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    q_yes numeric(15,2) DEFAULT 0,
    q_no numeric(15,2) DEFAULT 0,
    CONSTRAINT markets_resolved_outcome_check CHECK (((resolved_outcome)::text = ANY ((ARRAY['YES'::character varying, 'NO'::character varying, NULL::character varying])::text[]))),
    CONSTRAINT markets_status_check CHECK (((status)::text = ANY ((ARRAY['OPEN'::character varying, 'CLOSED'::character varying, 'RESOLVED'::character varying])::text[])))
);


ALTER TABLE public.markets OWNER TO neondb_owner;

--
-- Name: settlement_payouts; Type: TABLE; Schema: public; Owner: neondb_owner
--

CREATE TABLE public.settlement_payouts (
    id uuid DEFAULT public.uuid_generate_v4() NOT NULL,
    settlement_id uuid,
    market_id uuid,
    local_user_id uuid,
    holding_id uuid,
    central_user_id uuid NOT NULL,
    payout_amount numeric(15,2) NOT NULL,
    idempotency_key character varying(255) NOT NULL,
    payout_status character varying(20) DEFAULT 'PENDING'::character varying NOT NULL,
    retry_count integer DEFAULT 0 NOT NULL,
    last_error text,
    central_transaction_id uuid,
    processed_at timestamp without time zone,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT settlement_payouts_payout_status_check CHECK (((payout_status)::text = ANY ((ARRAY['PENDING'::character varying, 'PROCESSING'::character varying, 'PAID'::character varying, 'FAILED'::character varying])::text[])))
);


ALTER TABLE public.settlement_payouts OWNER TO neondb_owner;

--
-- Name: comments comments_pkey; Type: CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.comments
    ADD CONSTRAINT comments_pkey PRIMARY KEY (id);


--
-- Name: holdings holdings_local_user_id_market_id_outcome_type_key; Type: CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.holdings
    ADD CONSTRAINT holdings_local_user_id_market_id_outcome_type_key UNIQUE (local_user_id, market_id, outcome_type);


--
-- Name: holdings holdings_pkey; Type: CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.holdings
    ADD CONSTRAINT holdings_pkey PRIMARY KEY (id);


--
-- Name: local_orders local_orders_pkey; Type: CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.local_orders
    ADD CONSTRAINT local_orders_pkey PRIMARY KEY (id);


--
-- Name: local_users local_users_central_user_id_key; Type: CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.local_users
    ADD CONSTRAINT local_users_central_user_id_key UNIQUE (central_user_id);


--
-- Name: local_users local_users_email_key; Type: CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.local_users
    ADD CONSTRAINT local_users_email_key UNIQUE (email);


--
-- Name: local_users local_users_pkey; Type: CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.local_users
    ADD CONSTRAINT local_users_pkey PRIMARY KEY (id);


--
-- Name: local_users local_users_username_key; Type: CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.local_users
    ADD CONSTRAINT local_users_username_key UNIQUE (username);


--
-- Name: market_settlements market_settlements_market_id_key; Type: CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.market_settlements
    ADD CONSTRAINT market_settlements_market_id_key UNIQUE (market_id);


--
-- Name: market_settlements market_settlements_pkey; Type: CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.market_settlements
    ADD CONSTRAINT market_settlements_pkey PRIMARY KEY (id);


--
-- Name: markets markets_pkey; Type: CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.markets
    ADD CONSTRAINT markets_pkey PRIMARY KEY (id);


--
-- Name: settlement_payouts settlement_payouts_idempotency_key_key; Type: CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.settlement_payouts
    ADD CONSTRAINT settlement_payouts_idempotency_key_key UNIQUE (idempotency_key);


--
-- Name: settlement_payouts settlement_payouts_pkey; Type: CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.settlement_payouts
    ADD CONSTRAINT settlement_payouts_pkey PRIMARY KEY (id);


--
-- Name: comments comments_local_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.comments
    ADD CONSTRAINT comments_local_user_id_fkey FOREIGN KEY (local_user_id) REFERENCES public.local_users(id) ON DELETE CASCADE;


--
-- Name: comments comments_market_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.comments
    ADD CONSTRAINT comments_market_id_fkey FOREIGN KEY (market_id) REFERENCES public.markets(id) ON DELETE CASCADE;


--
-- Name: holdings holdings_local_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.holdings
    ADD CONSTRAINT holdings_local_user_id_fkey FOREIGN KEY (local_user_id) REFERENCES public.local_users(id) ON DELETE CASCADE;


--
-- Name: holdings holdings_market_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.holdings
    ADD CONSTRAINT holdings_market_id_fkey FOREIGN KEY (market_id) REFERENCES public.markets(id) ON DELETE CASCADE;


--
-- Name: local_orders local_orders_local_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.local_orders
    ADD CONSTRAINT local_orders_local_user_id_fkey FOREIGN KEY (local_user_id) REFERENCES public.local_users(id) ON DELETE CASCADE;


--
-- Name: local_orders local_orders_market_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.local_orders
    ADD CONSTRAINT local_orders_market_id_fkey FOREIGN KEY (market_id) REFERENCES public.markets(id) ON DELETE CASCADE;


--
-- Name: market_settlements market_settlements_market_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.market_settlements
    ADD CONSTRAINT market_settlements_market_id_fkey FOREIGN KEY (market_id) REFERENCES public.markets(id) ON DELETE CASCADE;


--
-- Name: settlement_payouts settlement_payouts_holding_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.settlement_payouts
    ADD CONSTRAINT settlement_payouts_holding_id_fkey FOREIGN KEY (holding_id) REFERENCES public.holdings(id) ON DELETE SET NULL;


--
-- Name: settlement_payouts settlement_payouts_local_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.settlement_payouts
    ADD CONSTRAINT settlement_payouts_local_user_id_fkey FOREIGN KEY (local_user_id) REFERENCES public.local_users(id) ON DELETE CASCADE;


--
-- Name: settlement_payouts settlement_payouts_market_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.settlement_payouts
    ADD CONSTRAINT settlement_payouts_market_id_fkey FOREIGN KEY (market_id) REFERENCES public.markets(id) ON DELETE CASCADE;


--
-- Name: settlement_payouts settlement_payouts_settlement_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.settlement_payouts
    ADD CONSTRAINT settlement_payouts_settlement_id_fkey FOREIGN KEY (settlement_id) REFERENCES public.market_settlements(id) ON DELETE CASCADE;


--
-- Name: DEFAULT PRIVILEGES FOR SEQUENCES; Type: DEFAULT ACL; Schema: public; Owner: cloud_admin
--

ALTER DEFAULT PRIVILEGES FOR ROLE cloud_admin IN SCHEMA public GRANT ALL ON SEQUENCES TO neon_superuser WITH GRANT OPTION;


--
-- Name: DEFAULT PRIVILEGES FOR TABLES; Type: DEFAULT ACL; Schema: public; Owner: cloud_admin
--

ALTER DEFAULT PRIVILEGES FOR ROLE cloud_admin IN SCHEMA public GRANT ALL ON TABLES TO neon_superuser WITH GRANT OPTION;


--
-- PostgreSQL database dump complete
--

\unrestrict LiC0XVzHzDDmsiOprKoJVYvxK29BGHtlfIOoelqOS0pbIK3uxADizovQrjCbCfo

