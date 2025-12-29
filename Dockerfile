FROM nginx:alpine


RUN rm -rf /usr/share/nginx/html/*


COPY HTML/ /usr/share/nginx/html/
COPY CSS/ /usr/share/nginx/html/CSS/
COPY JS/ /usr/share/nginx/html/JS/


RUN test -s /usr/share/nginx/html/index.html || test -s /usr/share/nginx/html/login.html
RUN test -s /usr/share/nginx/html/CSS/main.css
RUN test -s /usr/share/nginx/html/JS/main.js

EXPOSE 80 443
