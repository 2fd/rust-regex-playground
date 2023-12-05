import Documentation from './Documentation.js'

test('getUrl', () => {
  const doc = Documentation.fromPackage('regex-syntax', '0.6.6')
  expect(
    doc.getUrl('enum', 'regex_syntax::hir::HirKind', 'Alternation')
  ).toEqual(
    'https://docs.rs/regex-syntax/0.6.6/regex_syntax/hir/enum.HirKind.html#variant.Alternation'
  )
})
