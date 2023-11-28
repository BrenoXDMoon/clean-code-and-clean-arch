import crypto from "crypto";
import pgp from "pg-promise";
import express, {Request, Response} from "express";

const app = express();
app.use(express.json());
app.listen(3000);

app.post("/signup", async function (request: Request, response: Response){
	const input = request.body;
	const output = await signup(input);
	response.json(output);
});

app.get("/accounts/:accountId", async function (request: Request, response: Response){
	const accountId = request.params.accountId;
	const output = await getAccount(accountId);
    response.json(output);
});

function validateCpf (cpf: string) {
	if (!cpf) return false;
	cpf = clean(cpf);
	if (isInvalidLength(cpf)) return false;
	if (allDigitsAreTheSame(cpf)) return false;
	const dg1 = calculateDigit(cpf, 10);
	const dg2 = calculateDigit(cpf, 11);
	return extractCheckDigit(cpf) === `${dg1}${dg2}`;
}

function clean (cpf: string) {
	return cpf.replace(/\D/g, "");
}

function isInvalidLength (cpf: string) {
	return cpf.length !== 11;
}

function allDigitsAreTheSame (cpf: string) {
	return cpf.split("").every(c => c === cpf[0]);
}

function calculateDigit (cpf: string, factor: number) {
	let total = 0;
	for (const digit of cpf) {
		if (factor > 1) total += parseInt(digit) * factor--;
	}
	const rest = total%11;
	return (rest < 2) ? 0 : 11 - rest;
}

function extractCheckDigit (cpf: string) {
	return cpf.slice(9);
}

async function signup (input: any): Promise<any> {
	const connection = getConnection();
	try {
		const accountId = crypto.randomUUID();
		const [account] = await connection.query("select * from cccat14.account where email = $1", [input.email]);
		if (account) throw new Error("Duplicated account");
		if (isInvalidName(input.name)) throw new Error("Invalid name");
		if (isInvalidEmail(input.email)) throw new Error("Invalid email");
		if (!validateCpf(input.cpf)) throw new Error("Invalid cpf");
		if (input.isDriver && isInvalidCarPlate(input.carPlate)) throw new Error("Invalid car plate");
		await connection.query("insert into cccat14.account (account_id, name, email, cpf, car_plate, is_passenger, is_driver) values ($1, $2, $3, $4, $5, $6, $7)", [accountId, input.name, input.email, input.cpf, input.carPlate, !!input.isPassenger, !!input.isDriver]);
		return {
			accountId
		};
	} finally {
		await connection.$pool.end();
	}
}

function isInvalidName (name: string) {
	return !name.match(/[a-zA-Z] [a-zA-Z]+/);
}

function isInvalidEmail (email: string) {
	return !email.match(/^(.+)@(.+)$/);
}

function isInvalidCarPlate (carPlate: string) {
	return !carPlate.match(/[A-Z]{3}[0-9]{4}/);
}

async function getAccount (accountId: string) {
	const connection = getConnection();
	const [account] = await connection.query("select * from cccat14.account where account_id = $1", [accountId]);
	await connection.$pool.end();
	return account;
}

//TODO: validar conforme o progresso das aulas a necessidade de mover essa criação de conexão para outro arquivo
function getConnection(){
	return pgp()("root://root:1234@localhost:5432/app-clean-arch");
}