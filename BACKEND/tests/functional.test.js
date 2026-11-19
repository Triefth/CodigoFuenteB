const { describe, it } = require("node:test");
const assert = require("node:assert/strict");
const { normalizeRut } = require("../src/utils/rut");

let authValidations = null;
let pacienteValidations = null;
try {
  authValidations = require("../src/validations/auth");
  pacienteValidations = require("../src/validations/pacientes");
} catch {
  // Si aún no se ejecuta npm install en BACKEND, se omiten las pruebas basadas en yup
}

describe("Pruebas Funcionales - Utilidad de RUT (CuidartePlus)", () => {
  it("normaliza un RUT con puntos manteniendo guión y dígito verificador", () => {
    assert.equal(normalizeRut("12.345.678-9"), "12345678-9");
    assert.equal(normalizeRut("9.876.543-K"), "9876543-K");
  });

  it("mantiene intacto un RUT ya normalizado", () => {
    assert.equal(normalizeRut("12345678-9"), "12345678-9");
  });

  it("maneja entradas vacías o nulas sin lanzar excepciones", () => {
    assert.equal(normalizeRut(""), "");
    assert.equal(normalizeRut(null), null);
  });
});

describe("Pruebas Funcionales - Validación de Esquemas de Entrada", () => {
  it("valida esquema de login y registro cuando yup está instalado", async (t) => {
    if (!authValidations) {
      t.skip("Requiere ejecutar npm install en BACKEND");
      return;
    }

    await assert.doesNotReject(() =>
      authValidations.loginSchema.validate({
        nombre_usuario: "dr_garcia",
        password: "Password123!",
      })
    );

    await assert.rejects(() =>
      authValidations.registerSchema.validate({
        nombre_usuario: "ab",
        password: "123",
        correo: "correo-invalido",
        rut: "formato-malo",
      })
    );
  });

  it("valida datos clínicos obligatorios de paciente según esquema", async (t) => {
    if (!pacienteValidations) {
      t.skip("Requiere ejecutar npm install en BACKEND");
      return;
    }

    await assert.doesNotReject(() =>
      pacienteValidations.pacienteSchema.validate({
        rut: "12.345.678-9",
        primer_nombre: "Ana",
        apellido_paterno: "Pérez",
        fecha_nacimiento: "1990-05-15",
        sexo: "F",
        email: "ana.perez@example.com",
      })
    );

    await assert.rejects(() =>
      pacienteValidations.pacienteSchema.validate({
        rut: "123",
        primer_nombre: "A",
        apellido_paterno: "P",
        fecha_nacimiento: "2099-01-01",
        sexo: "X",
        email: "no-es-email",
      })
    );
  });
});
