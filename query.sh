#!/usr/bin/env bash

curl 'https://auction.ebidlocal.com/Public/GlobalSearch/GetGlobalSearchResults?pageNumber=1&pagesize=10000&filter=Current&search=table' \
  --header 'Accept: */*' \
  --header 'Accept-Language: en-US,en;q=0.9' \
  --header 'Cache-Control: no-cache' \
  --header 'Connection: keep-alive' \
  --header 'Pragma: no-cache' \
  --header 'Sec-Fetch-Dest: empty' \
  --header 'Sec-Fetch-Mode: cors' \
  --header 'Sec-Fetch-Site: same-origin' \
  --header 'User-Agent: Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/133.0.0.0 Safari/537.36' \
  --header 'X-Requested-With: XMLHttpRequest' \
  --header 'sec-ch-ua: "Not(A:Brand";v="99", "Google Chrome";v="133", "Chromium";v="133"' \
  --header 'sec-ch-ua-mobile: ?0' \
  --header 'sec-ch-ua-platform: "Linux"'
