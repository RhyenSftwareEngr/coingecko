// CryptoPeekBootstrap.jsx — React + Bootstrap 5 rewrite
// Requires: npm install react-bootstrap bootstrap
// In index.js or App.js: import 'bootstrap/dist/css/bootstrap.min.css';
import "bootstrap/dist/css/bootstrap.min.css";
import React, { useEffect, useMemo, useState } from "react";
import {
  Container,
  Navbar,
  Nav,
  Form,
  Button,
  Table,
  Spinner,
  ButtonGroup,
  InputGroup,
  ToggleButton,
} from "react-bootstrap";

const API = "https://api.coingecko.com/api/v3";
const PAGE_SIZE = 10;
const CURRENCIES = ["usd", "php", "eur", "jpy", "gbp"];
const TABS = [
  { key: "prices", label: "Prices ⚡", endpoint: "/simple/price" },
  { key: "coins", label: "Coins & Tokens", endpoint: "/coins/list" },
  { key: "chains", label: "Blockchains", endpoint: "/asset_platforms" },
  { key: "exchanges", label: "Exchanges", endpoint: "/exchanges/list" },
  { key: "nfts", label: "NFTs", endpoint: "/nfts/list" },
  { key: "trending", label: "Trending 🔥", endpoint: "/search/trending" },
  // { key: "snapshot", label: "Snapshot", endpoint: "/global" },
  { key: "search", label: "Search", endpoint: "/search" },
];

export default function CryptoPeekBootstrap() {
  const [tab, setTab] = useState("prices");
  const [vs, setVs] = useState("usd");
  const [q, setQ] = useState("");
  const [data, setData] = useState([]);
  const [status, setStatus] = useState("idle");
  const [page, setPage] = useState(0);
  const [all, setAll] = useState(false);

  useEffect(() => {
    const active = TABS.find((t) => t.key === tab);
    if (!active) return;
    const fetchData = async () => {
      setStatus("loading");
      setPage(0);
      setAll(false);
      try {
        let url = `${API}${active.endpoint}`;
        if (tab === "prices")
          url += `?ids=bitcoin,ethereum,dogecoin&vs_currencies=${vs}`;
        if (tab === "search")
          url += `?query=${encodeURIComponent(q || "bitcoin")}`;
        const res = await fetch(url);
        if (!res.ok) throw new Error("Request failed");
        const json = await res.json();
        let arr;
        switch (tab) {
          case "prices":
            arr = Object.entries(json).map(([k, v]) => ({
              id: k,
              name: k,
              price: v[vs],
            }));
            break;

          case "trending":
            arr = json.coins.map((c) => c.item);
            break;
          case "search":
            arr = json.coins;
            break;
          default:
            arr = json;
        }
        setData(arr);
        setStatus("idle");
      } catch (e) {
        console.error(e);
        setStatus("error");
      }
    };
    fetchData();
  }, [tab, vs, q]);

  const start = page * PAGE_SIZE;
  const visible = useMemo(
    () => (all ? data : data.slice(start, start + PAGE_SIZE)),
    [data, page, all]
  );
  const maxPg = Math.floor((data.length - 1) / PAGE_SIZE);
  const disabledPrev = all || page === 0;
  const disabledNext = all || page >= maxPg;
  const disabledAll = all || data.length === 0;
  const link = (it) =>
    it.url ?? `https://www.coingecko.com/coins/${it.id || it.name}`;

  return (
    <>
      <Navbar bg="light" expand="lg" sticky="top" className="mb-4">
        <Container>
          <Navbar.Brand>Crypto Peek</Navbar.Brand>
          <Navbar.Toggle aria-controls="nav-tabs" />
          <Navbar.Collapse id="nav-tabs">
            <Nav
              activeKey={tab}
              onSelect={(k) => setTab(k)}
              className="me-auto"
            >
              {TABS.map((t) => (
                <Nav.Item key={t.key}>
                  <Nav.Link eventKey={t.key}>{t.label}</Nav.Link>
                </Nav.Item>
              ))}
            </Nav>
            {tab === "prices" && (
              <Form.Select
                value={vs}
                onChange={(e) => setVs(e.target.value)}
                className="w-auto me-2"
              >
                {CURRENCIES.map((c) => (
                  <option key={c} value={c}>
                    {c.toUpperCase()}
                  </option>
                ))}
              </Form.Select>
            )}
            {tab === "search" && (
              <Form.Control
                type="search"
                placeholder="Search coin..."
                value={q}
                onChange={(e) => setQ(e.target.value)}
                className="w-auto"
              />
            )}
          </Navbar.Collapse>
        </Container>
      </Navbar>

      <Container>
        {status === "loading" && <Spinner animation="border" />}
        {status === "error" && (
          <p className="text-danger">Error loading data.</p>
        )}
        {status === "idle" && visible.length === 0 && <p>No results.</p>}

        {status === "idle" && visible.length > 0 && (
          <Table hover responsive striped>
            <tbody>
              {visible.map((it) => (
                <tr key={it.id || it.name}>
                  <td>
                    <a
                      href={link(it)}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      {it.name || it.id || it.symbol}
                    </a>
                  </td>
                  {it.price !== undefined && (
                    <td className="text-end">
                      {vs.toUpperCase()}{" "}
                      {it.price.toLocaleString(undefined, {
                        maximumFractionDigits: 8,
                      })}
                    </td>
                  )}
                  {it.market_cap && (
                    <td className="text-end">
                      MC ${it.market_cap.toLocaleString()}
                    </td>
                  )}
                </tr>
              ))}
            </tbody>
          </Table>
        )}

        <ButtonGroup className="d-flex justify-content-center mb-4">
          <Button
            variant="secondary"
            disabled={disabledPrev}
            onClick={() => setPage((p) => p - 1)}
          >
            Previous
          </Button>
          <ToggleButton
            type="checkbox"
            variant="primary"
            checked={all}
            disabled={disabledAll}
            onChange={() => setAll(true)}
          >
            Top 100
          </ToggleButton>
          <Button
            variant="secondary"
            disabled={disabledNext}
            onClick={() => setPage((p) => p + 1)}
          >
            Next
          </Button>
        </ButtonGroup>
      </Container>

      <footer className="text-center py-3">
        <small>Data from CoinGecko • Built with React & Bootstrap</small>
      </footer>
    </>
  );
}
