const { describe, it } = require("node:test");
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");

const ROOT_DIR = path.resolve(__dirname, "..", "..");
const BACKEND_DIR = path.resolve(__dirname, "..");

function readProjectFile(relativePath) {
  return fs.readFileSync(path.join(ROOT_DIR, relativePath), "utf8");
}

describe("Pruebas Normativas y de Seguridad - Controles de Acceso y Trazabilidad (Ley 19.628 / 20.584)", () => {
  it("verifica control de autenticación/autorización JWT en rutas sensibles", () => {
    const protectedRoutes = [
      "BACKEND/src/routes/pacientes.js",
      "BACKEND/src/routes/examenes.js",
      "BACKEND/src/routes/documentos.js",
      "BACKEND/src/routes/audit.js",
      "BACKEND/src/routes/users.js",
    ];

    for (const routeFile of protectedRoutes) {
      const content = readProjectFile(routeFile);
      assert.match(
        content,
        /jwt\.verify|requireRole|Authorization/i,
        `${routeFile} debe implementar verificación de autenticación/autorización`
      );
    }
  });

  it("verifica registro de auditoría en eventos críticos de autenticación", () => {
    const authContent = readProjectFile("BACKEND/src/routes/auth.js");
    assert.match(
      authContent,
      /INSERT INTO auditoria/i,
      "auth.js debe registrar eventos de inicio de sesión en la tabla auditoria"
    );
  });

  it("verifica que el esquema de registro valide formato de RUT chileno", () => {
    const authValidation = readProjectFile("BACKEND/src/validations/auth.js");
    assert.match(
      authValidation,
      /rut:/,
      "auth.js debe incluir validación de formato de RUT"
    );
  });
});

describe("Pruebas de Calidad Sostenible y Preservación CI/CD (ISO/IEC 25010)", () => {
  it("verifica existencia de pipelines CI y CD automatizados", () => {
    const ciContent = readProjectFile(".github/workflows/ci.yml");
    const cdContent = readProjectFile(".github/workflows/cd.yml");

    assert.ok(ciContent.trim().length > 0, "ci.yml no debe estar vacío");
    assert.ok(cdContent.trim().length > 0, "cd.yml no debe estar vacío");
    assert.match(ciContent, /npm audit/, "ci.yml debe ejecutar análisis SCA (npm audit)");
    assert.match(ciContent, /npm run lint/, "ci.yml debe ejecutar análisis estático (lint)");
    assert.match(ciContent, /npm test/, "ci.yml debe ejecutar pruebas automatizadas");
  });

  it("verifica existencia de Dependabot para mantenimiento preventivo", () => {
    const dependabot = readProjectFile(".github/dependabot.yml");
    assert.match(dependabot, /package-ecosystem:\s*"npm"/);
    assert.match(dependabot, /package-ecosystem:\s*"docker"/);
  });

  it("verifica configuración de healthcheck en base de datos Docker", () => {
    const compose = readProjectFile("docker-compose.yml");
    assert.match(compose, /healthcheck:/, "docker-compose.yml debe definir healthcheck");
    assert.match(compose, /pg_isready/, "PostgreSQL debe verificar disponibilidad con pg_isready");
  });
});
