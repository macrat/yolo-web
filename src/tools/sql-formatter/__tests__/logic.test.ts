import { describe, it, expect } from "vitest";
import { formatSql, minifySql } from "../logic";

describe("formatSql", () => {
  it("formats a simple SELECT query", () => {
    const input = "select id, name from users where id = 1";
    const result = formatSql(input);
    expect(result).toContain("SELECT");
    expect(result).toContain("FROM");
    expect(result).toContain("WHERE");
    // Each major clause on its own line
    const lines = result.split("\n");
    expect(lines.some((l) => l.trim().startsWith("SELECT"))).toBe(true);
    expect(lines.some((l) => l.trim().startsWith("FROM"))).toBe(true);
    expect(lines.some((l) => l.trim().startsWith("WHERE"))).toBe(true);
  });

  it("formats a JOIN query", () => {
    const input =
      "select u.id, u.name, o.total from users u inner join orders o on u.id = o.user_id where o.total > 100";
    const result = formatSql(input);
    expect(result).toContain("INNER JOIN");
    expect(result).toContain("ON");
    const lines = result.split("\n");
    expect(lines.some((l) => l.trim().startsWith("INNER JOIN"))).toBe(true);
    expect(lines.some((l) => l.trim().startsWith("ON"))).toBe(true);
  });

  it("formats WHERE with AND/OR on separate lines", () => {
    const input =
      "select * from users where status = 'active' and age > 18 or role = 'admin'";
    const result = formatSql(input);
    const lines = result.split("\n");
    expect(lines.some((l) => l.trim().startsWith("AND"))).toBe(true);
    expect(lines.some((l) => l.trim().startsWith("OR"))).toBe(true);
  });

  it("formats a subquery with parentheses", () => {
    const input =
      "select * from users where id in (select user_id from orders where total > 100)";
    const result = formatSql(input);
    expect(result).toContain("(");
    expect(result).toContain(")");
    // Inner SELECT should be indented
    const lines = result.split("\n");
    const innerSelect = lines.find(
      (l) => l.trim().startsWith("SELECT") && l.startsWith(" "),
    );
    expect(innerSelect).toBeDefined();
  });

  it("formats an INSERT statement", () => {
    const input =
      "insert into users (id, name, email) values (1, 'John', 'john@example.com')";
    const result = formatSql(input);
    expect(result).toContain("INSERT INTO");
    expect(result).toContain("VALUES");
  });

  it("formats an UPDATE statement", () => {
    const input =
      "update users set name = 'Jane', email = 'jane@example.com' where id = 1";
    const result = formatSql(input);
    expect(result).toContain("UPDATE");
    expect(result).toContain("SET");
    expect(result).toContain("WHERE");
  });

  it("formats a DELETE statement", () => {
    const input = "delete from users where id = 1";
    const result = formatSql(input);
    expect(result).toContain("DELETE");
    expect(result).toContain("FROM");
    expect(result).toContain("WHERE");
  });

  it("formats a CREATE TABLE statement", () => {
    const input =
      "create table users (id int, name varchar(255), email varchar(255))";
    const result = formatSql(input);
    expect(result).toContain("CREATE");
    expect(result).toContain("TABLE");
  });

  it("uppercases SQL keywords by default", () => {
    const input = "select id from users where id = 1";
    const result = formatSql(input);
    expect(result).toContain("SELECT");
    expect(result).toContain("FROM");
    expect(result).toContain("WHERE");
    expect(result).not.toMatch(/\bselect\b/);
    expect(result).not.toMatch(/\bfrom\b/);
    expect(result).not.toMatch(/\bwhere\b/);
  });

  it("lowercases keywords when uppercase option is false", () => {
    const input = "SELECT id FROM users WHERE id = 1";
    const result = formatSql(input, { uppercase: false });
    expect(result).toContain("select");
    expect(result).toContain("from");
    expect(result).toContain("where");
  });

  it("preserves single-quoted strings", () => {
    const input = "select * from users where name = 'O''Brien'";
    const result = formatSql(input);
    expect(result).toContain("'O''Brien'");
  });

  it("preserves double-quoted identifiers", () => {
    const input = 'select "user name" from users';
    const result = formatSql(input);
    expect(result).toContain('"user name"');
  });

  it("respects custom indent option", () => {
    const input = "select * from users where status = 'active' and age > 18";
    const result = formatSql(input, { indent: "    " });
    const lines = result.split("\n");
    const andLine = lines.find((l) => l.trim().startsWith("AND"));
    expect(andLine).toBeDefined();
    expect(andLine!.startsWith("    ")).toBe(true);
  });

  it("handles GROUP BY and ORDER BY as compound keywords", () => {
    const input =
      "select status, count(*) from users group by status order by status asc";
    const result = formatSql(input);
    const lines = result.split("\n");
    expect(lines.some((l) => l.trim().startsWith("GROUP BY"))).toBe(true);
    expect(lines.some((l) => l.trim().startsWith("ORDER BY"))).toBe(true);
  });

  it("returns empty string for empty input", () => {
    expect(formatSql("")).toBe("");
    expect(formatSql("   ")).toBe("");
  });

  it("preserves line comments", () => {
    const input = "select id -- get the id\nfrom users";
    const result = formatSql(input);
    expect(result).toContain("-- get the id");
  });

  it("preserves block comments", () => {
    const input = "select /* all columns */ * from users";
    const result = formatSql(input);
    expect(result).toContain("/* all columns */");
  });

  it("separates multiple queries with blank lines", () => {
    const input = "select 1; select 2;";
    const result = formatSql(input);
    expect(result).toContain("\n\n");
  });
});

describe("minifySql", () => {
  it("compresses whitespace into single spaces", () => {
    const input = "SELECT  id,\n  name\nFROM   users\nWHERE  id = 1";
    const result = minifySql(input);
    expect(result).not.toContain("\n");
    expect(result).not.toContain("  ");
  });

  it("preserves string literals", () => {
    const input = "SELECT * FROM users WHERE name = 'hello   world'";
    const result = minifySql(input);
    expect(result).toContain("'hello   world'");
  });

  it("returns empty string for empty input", () => {
    expect(minifySql("")).toBe("");
    expect(minifySql("   ")).toBe("");
  });

  it("keeps comments intact", () => {
    const input = "SELECT id -- comment\nFROM users";
    const result = minifySql(input);
    expect(result).toContain("-- comment");
  });

  it("produces compact output", () => {
    const input = "SELECT\n  id,\n  name\nFROM\n  users\nWHERE\n  id = 1";
    const result = minifySql(input);
    // Should be a single line (except for line comments)
    const nonCommentLines = result.split("\n").filter((l) => !l.includes("--"));
    expect(nonCommentLines.length).toBeLessThanOrEqual(1);
  });
});
