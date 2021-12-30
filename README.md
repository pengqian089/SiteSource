# SiteSource
[![](https://data.jsdelivr.com/v1/package/gh/pengqian089/SiteSource/badge)](https://www.jsdelivr.com/package/gh/pengqian089/SiteSource)

Some static resources for my website.


``` bash
# 自签localhost证书
openssl req -x509 -out localhost.crt -keyout localhost.key \
  -newkey rsa:2048 -nodes -sha256 \
  -subj '/CN=localhost' -extensions EXT -config <( \
   printf "[dn]\nCN=localhost\n[req]\ndistinguished_name = dn\n[EXT]\nsubjectAltName=DNS:localhost\nkeyUsage=digitalSignature\nextendedKeyUsage=serverAuth")
