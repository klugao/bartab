import { z } from "zod";

// Validação para cliente
export const customerSchema = z.object({
  name: z
    .string()
    .min(1, "Nome é obrigatório")
    .min(2, "Nome deve ter pelo menos 2 caracteres")
    .max(100, "Nome deve ter no máximo 100 caracteres"),
  phone: z
    .string()
    .optional()
    .refine((phone) => !phone || phone.length >= 10, {
      message: "Telefone deve ter pelo menos 10 dígitos",
    }),
  email: z
    .string()
    .optional()
    .refine((email) => !email || z.string().email().safeParse(email).success, {
      message: "E-mail deve ter um formato válido",
    }),
});

// Validação para item
export const itemSchema = z.object({
  name: z
    .string()
    .min(1, "Nome é obrigatório")
    .min(2, "Nome deve ter pelo menos 2 caracteres")
    .max(100, "Nome deve ter no máximo 100 caracteres"),
  price: z
    .number({ message: "Preço é obrigatório" })
    .positive("Preço deve ser maior que zero")
    .max(9999.99, "Preço deve ser menor que R$ 9.999,99"),
  description: z
    .string()
    .max(255, "Descrição deve ter no máximo 255 caracteres")
    .optional(),
  category: z
    .string()
    .max(50, "Categoria deve ter no máximo 50 caracteres")
    .optional(),
});

// Validação para adicionar item à conta
export const addItemToTabSchema = z.object({
  itemId: z.string().min(1, "Item é obrigatório"),
  qty: z
    .number({ message: "Quantidade é obrigatória" })
    .int("Quantidade deve ser um número inteiro")
    .positive("Quantidade deve ser maior que zero")
    .max(99, "Quantidade deve ser menor que 100"),
});

// Validação para abrir nova conta
export const newTabSchema = z.object({
  customerId: z.string().optional(),
  customerName: z
    .string()
    .optional()
    .refine((name) => !name || name.length >= 2, {
      message: "Nome deve ter pelo menos 2 caracteres",
    }),
});

// Validação para pagamento
export const paymentSchema = z.object({
  method: z.enum(['dinheiro', 'debito', 'credito', 'pix', 'pagar_depois'], {
    message: "Método de pagamento é obrigatório",
  }),
  amount: z
    .number({ message: "Valor é obrigatório" })
    .positive("Valor deve ser maior que zero"),
  notes: z
    .string()
    .max(255, "Observações devem ter no máximo 255 caracteres")
    .optional(),
});

// Validação para pagamento parcial de dívida
export const debtPaymentSchema = z.object({
  amount: z
    .number({ message: "Valor é obrigatório" })
    .positive("Valor deve ser maior que zero"),
  method: z.enum(['dinheiro', 'debito', 'credito', 'pix'], {
    message: "Método de pagamento é obrigatório",
  }),
  notes: z
    .string()
    .max(255, "Observações devem ter no máximo 255 caracteres")
    .optional(),
});

// Tipos TypeScript gerados a partir dos esquemas
export type CustomerFormData = z.infer<typeof customerSchema>;
export type ItemFormData = z.infer<typeof itemSchema>;
export type AddItemToTabFormData = z.infer<typeof addItemToTabSchema>;
export type NewTabFormData = z.infer<typeof newTabSchema>;
export type PaymentFormData = z.infer<typeof paymentSchema>;
export type DebtPaymentFormData = z.infer<typeof debtPaymentSchema>;