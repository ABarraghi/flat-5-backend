import app from './app';
import database from './database';
import auth from './auth';
import firebase from './firebase';
import storage from './storage';
import logging from './logging';
import mail from './mail';
import sms from './sms';
import cache from './cache';
import payment from './payment';
import google from '@config/google';

export default [app, database, auth, cache, firebase, storage, logging, mail, sms, payment, google];
