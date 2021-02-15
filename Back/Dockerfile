FROM node:latest

RUN mkdir /usr/local/repo
RUN apt update; \
    apt install git -y;\
    git clone https://github.com/WenceslaoMateos/bd2tpfinal /usr/local/repo;

WORKDIR /usr/local/repo/Back
RUN npm install

EXPOSE 51808
CMD npm start