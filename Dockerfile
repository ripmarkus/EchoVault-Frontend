FROM nginx:alpine

RUN rm -rf /usr/share/nginx/html/*

COPY html/ /usr/share/nginx/html/
COPY js/ /usr/share/nginx/html/js/
COPY imgs/ /usr/share/nginx/html/imgs/

RUN test -s /usr/share/nginx/html/index.html || test -s /usr/share/nginx/html/login.html

EXPOSE 80 443
