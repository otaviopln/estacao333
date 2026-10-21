import test from 'node:test';
import assert from 'node:assert/strict';
import { personalize, playerName, profile, resetProfile, sanitizeName, setProfile } from '../src/core/profile.js';
import { SKIN_FEMALE, SKIN_MALE } from '../src/sprites/detective-skins.js';

test.beforeEach(() => resetProfile());

test('sanitizeName: só letras, capitalizado, no máximo 14 caracteres', () => {
  assert.equal(sanitizeName('  ana   maria da silva  '), 'Ana Maria da S');
  assert.equal(sanitizeName('joão-pedro'), 'João-pedro');
  assert.equal(sanitizeName('<b>Zé</b>123'), 'Bzéb');
  assert.equal(sanitizeName('MARIANA SOUZA LIMA').length <= 14, true);
  assert.equal(sanitizeName(null), '');
  assert.equal(sanitizeName('   '), '');
});

test('perfil padrão não altera nenhum texto (o jogo original continua idêntico)', () => {
  for (const s of ['Detetive! Acorde.', 'Boa noite, doutor.', 'O detetive volta ao trem.', 'Se o senhor achar a moça, me avisa.', 'Quer ajuda, meu filho?', 'Modo detetive ativo.']) assert.equal(personalize(s), s);
  assert.equal(playerName(), 'Detetive');
});

test('jogadora: concordância de gênero em falas escritas no masculino', () => {
  setProfile({ name: '', female: true });
  assert.equal(personalize('Boa noite, doutor.'), 'Boa noite, doutora.');
  assert.equal(personalize('Quer ajuda, meu filho?'), 'Quer ajuda, minha filha?');
  assert.equal(personalize('O detetive volta ao trem. Obrigado ao detetive. Um detetive, uma IA.'), 'A detetiva volta ao trem. Obrigado à detetiva. Uma detetiva, uma IA.');
  assert.equal(personalize('Vi nada não, moço.'), 'Vi nada não, moça.');
  assert.equal(personalize('Se o senhor achar a moça, me avisa.'), 'Se a senhora achar a moça, me avisa.');
  assert.equal(personalize('Faço preço de detetive.'), 'Faço preço de detetiva.');
});

test('exceções: não troca o gênero do que não é o jogador', () => {
  setProfile({ name: '', female: true });
  assert.equal(personalize('Modo detetive ativo.'), 'Modo detetive ativo.');
  assert.equal(personalize('Quando eu crescer vou ser detetive.'), 'Quando eu crescer vou ser detetive.');
  assert.equal(personalize('Carrega a maleta do senhor de óculos.'), 'Carrega a maleta do senhor de óculos.');
  assert.equal(personalize('Amaro Siqueira, o senhor está preso.'), 'Amaro Siqueira, o senhor está preso.');
});

test('nome do jogador entra no vocativo "Detetive" e em tokens', () => {
  setProfile({ name: 'ana', female: true });
  assert.equal(personalize('Detetive! Eles fugiram.'), 'Detetiva Ana! Eles fugiram.');
  assert.equal(personalize('Boa noite, detetive.'), 'Boa noite, detetiva.');
  assert.equal(personalize('Falo com {sr}? Sou {nome}. {Ele} chegou. Obrigad{o}.'), 'Falo com a senhora? Sou Ana. Ela chegou. Obrigada.');
  setProfile({ name: 'Pedro', female: false });
  assert.equal(personalize('Detetive! Eles fugiram.'), 'Detetive Pedro! Eles fugiram.');
  assert.equal(personalize('Falo com {sr}? Obrigad{o}.'), 'Falo com o senhor? Obrigado.');
  assert.equal(profile.chosen, true);
});

test('personalize é idempotente (não repete o nome)', () => {
  setProfile({ name: 'Ana', female: true });
  const once = personalize('Detetive, venha. O detetive chegou.');
  assert.equal(personalize(once), once);
});

test('skins: mesmo molde 12×28, mas com identidade visual própria', () => {
  for (const skin of [SKIN_MALE, SKIN_FEMALE]) {
    for (const key of ['idle', 'a', 'b']) { assert.equal(skin[key].length, 28); assert.ok(skin[key].every((r) => r.length === 12)); }
    for (const row of skin.idle) for (const ch of row) assert.ok(ch === '.' || skin.pal[ch], `cor ausente para "${ch}"`);
  }
  assert.notDeepEqual(SKIN_FEMALE.idle, SKIN_MALE.idle);
  assert.notEqual(SKIN_FEMALE.pal.c, SKIN_MALE.pal.c);
  assert.equal(SKIN_FEMALE.crouch.length, SKIN_MALE.crouch.length);
});
