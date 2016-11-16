/*
 * IBM Confidential
 * OCO Source Materials
 * IBM Concerto - Blockchain Solution Framework
 * Copyright IBM Corp. 2016
 * The source code for this program is not published or otherwise
 * divested of its trade secrets, irrespective of what has
 * been deposited with the U.S. Copyright Office.
 */

'use strict';

const ModelFile = require('../lib/introspect/modelfile');
const ModelManager = require('../lib/modelmanager');
const fs = require('fs');

const chai = require('chai');
const should = chai.should();
chai.use(require('chai-things'));
const sinon = require('sinon');

describe('ModelManager', () => {

    describe('#accept', () => {

        it('should call the visitor', () => {
            let mm = new ModelManager();
            let visitor = {
                visit: sinon.stub()
            };
            mm.accept(visitor, ['some', 'args']);
            sinon.assert.calledOnce(visitor.visit);
            sinon.assert.calledWith(visitor.visit, mm, ['some', 'args']);
        });

    });

    describe('#addModelFile', () => {

        it('should add a model file from a string', () => {
            // create and populate the ModelManager with a model file
            let modelManager = new ModelManager();
            modelManager.should.not.be.null;
            modelManager.clearModelFiles();

            let modelBase = fs.readFileSync('./test/data/model/model-base.cto', 'utf8');
            modelBase.should.not.be.null;

            let res = modelManager.addModelFile(modelBase);
            modelManager.getModelFile('org.acme.base').getNamespace().should.equal('org.acme.base');
            res.should.be.an.instanceOf(ModelFile);
        });

        it('should add a model file from an object', () => {
            let mm = new ModelManager();
            let mf1 = sinon.createStubInstance(ModelFile);
            mf1.getNamespace.returns('org.doge');
            let res = mm.addModelFile(mf1);
            sinon.assert.calledOnce(mf1.validate);
            mm.modelFiles['org.doge'].should.equal(mf1);
            res.should.equal(mf1);
        });

    });

    describe('#addModelFiles', () => {

        it('should add model files from strings', () => {
            // create and populate the ModelManager with a model file
            let modelManager = new ModelManager();
            modelManager.should.not.be.null;
            modelManager.clearModelFiles();

            let modelBase = fs.readFileSync('./test/data/model/model-base.cto', 'utf8');
            modelBase.should.not.be.null;

            let farm2fork = fs.readFileSync('./test/data/model/farm2fork.cto', 'utf8');
            farm2fork.should.not.be.null;

            let concertoModel = fs.readFileSync('./test/data/model/concerto.cto', 'utf8');
            concertoModel.should.not.be.null;

            let res = modelManager.addModelFiles([concertoModel, modelBase, farm2fork]);
            modelManager.getModelFile('org.acme.base').getNamespace().should.equal('org.acme.base');
            res.should.all.be.an.instanceOf(ModelFile);
            res.should.have.lengthOf(3);
        });

        it('should add model files from objects', () => {
            let mm = new ModelManager();
            let mf1 = sinon.createStubInstance(ModelFile);
            mf1.getNamespace.returns('org.doge');
            let mf2 = sinon.createStubInstance(ModelFile);
            mf2.getNamespace.returns('org.fry');
            let res = mm.addModelFiles([mf1, mf2]);
            sinon.assert.calledOnce(mf1.validate);
            sinon.assert.calledOnce(mf2.validate);
            mm.modelFiles['org.doge'].should.equal(mf1);
            mm.modelFiles['org.fry'].should.equal(mf2);
            res.should.deep.equal([mf1, mf2]);
        });

        it('should add to existing model files from strings', () => {
            // create and populate the ModelManager with a model file
            let modelManager = new ModelManager();
            modelManager.should.not.be.null;
            modelManager.clearModelFiles();

            let modelBase = fs.readFileSync('./test/data/model/model-base.cto', 'utf8');
            modelBase.should.not.be.null;
            modelManager.addModelFile(modelBase);
            modelManager.getModelFile('org.acme.base').getNamespace().should.equal('org.acme.base');

            let farm2fork = fs.readFileSync('./test/data/model/farm2fork.cto', 'utf8');
            farm2fork.should.not.be.null;

            let concertoModel = fs.readFileSync('./test/data/model/concerto.cto', 'utf8');
            concertoModel.should.not.be.null;

            modelManager.addModelFiles([modelBase, concertoModel, farm2fork]);
            modelManager.getModelFile('org.acme.base').getNamespace().should.equal('org.acme.base');
            modelManager.getModelFile('org.acme').getNamespace().should.equal('org.acme');
        });

        it('should add to existing model files from objects', () => {
            let mm = new ModelManager();
            let mf1 = sinon.createStubInstance(ModelFile);
            mf1.getNamespace.returns('org.doge');
            mm.addModelFiles([mf1]);
            sinon.assert.calledOnce(mf1.validate);
            mm.modelFiles['org.doge'].should.equal(mf1);
            let mf2 = sinon.createStubInstance(ModelFile);
            mf2.getNamespace.returns('org.fry');
            mm.addModelFiles([mf2]);
            sinon.assert.calledTwice(mf1.validate);
            sinon.assert.calledOnce(mf2.validate);
            mm.modelFiles['org.doge'].should.equal(mf1);
            mm.modelFiles['org.fry'].should.equal(mf2);
        });

        it('should restore existing model files on validation error from strings', () => {
            // create and populate the ModelManager with a model file
            let modelManager = new ModelManager();
            modelManager.should.not.be.null;
            modelManager.clearModelFiles();

            let modelBase = fs.readFileSync('./test/data/model/model-base.cto', 'utf8');
            modelBase.should.not.be.null;
            modelManager.addModelFile(modelBase);
            modelManager.getModelFile('org.acme.base').getNamespace().should.equal('org.acme.base');

            let concertoModel = fs.readFileSync('./test/data/model/concerto.cto', 'utf8');
            concertoModel.should.not.be.null;

            try {
                modelManager.addModelFiles([concertoModel, 'invalid file']);
            }
            catch(err) {
                // ignore
            }

            modelManager.getModelFile('org.acme.base').getNamespace().should.equal('org.acme.base');
            modelManager.getModelFiles().length.should.equal(1);
        });

        it('should restore existing model files on validation error', () => {
            let mm = new ModelManager();
            let mf1 = sinon.createStubInstance(ModelFile);
            mf1.getNamespace.returns('org.doge');
            mm.addModelFiles([mf1]);
            sinon.assert.calledOnce(mf1.validate);
            mm.modelFiles['org.doge'].should.equal(mf1);
            let mf2 = sinon.createStubInstance(ModelFile);
            mf2.validate.throws(new Error('validation error'));
            mf2.getNamespace.returns('org.fry');
            (() => {
                mm.addModelFiles([mf2]);
            }).should.throw(/validation error/);
            sinon.assert.calledTwice(mf1.validate);
            sinon.assert.calledOnce(mf2.validate);
            mm.modelFiles['org.doge'].should.equal(mf1);
            should.equal(mm.modelFiles['org.fry'], undefined);
        });

    });

    describe('#updateModelFile', () => {

        it('throw if the namespace from an object does not exist', () => {
            let mm = new ModelManager();
            let mf1 = sinon.createStubInstance(ModelFile);
            mf1.getNamespace.returns('org.doge');
            (() => {
                mm.updateModelFile(mf1);
            }).should.throw(/model file does not exist/);
        });

        it('throw if the namespace from a string does not exist', () => {
            let mm = new ModelManager();
            let model = 'namespace org.doge\nasset TestAsset identified by assetId { o String assetId }';
            (() => {
                mm.updateModelFile(model);
            }).should.throw(/model file does not exist/);
        });

        it('should update from an object', () => {
            let mm = new ModelManager();
            let mf1 = sinon.createStubInstance(ModelFile);
            mf1.getNamespace.returns('org.doge');
            mf1.$marker = 'mf1';
            let res = mm.addModelFile(mf1);
            sinon.assert.calledOnce(mf1.validate);
            mm.modelFiles['org.doge'].should.equal(mf1);
            res.should.equal(mf1);

            let mf2 = sinon.createStubInstance(ModelFile);
            mf2.getNamespace.returns('org.doge');
            mf2.$marker = 'mf2';
            res = mm.updateModelFile(mf2);
            sinon.assert.calledOnce(mf2.validate);
            mm.modelFiles['org.doge'].should.equal(mf2);
            res.should.equal(mf2);
        });

        it('should update from a string', () => {
            let mm = new ModelManager();
            let model = 'namespace org.doge\nasset TestAsset identified by assetId { o String assetId }';
            mm.addModelFile(model);
            mm.modelFiles['org.doge'].definitions.should.equal(model);

            model = 'namespace org.doge\nasset TestAsset2 identified by assetId2 { o String assetId2 }';
            mm.updateModelFile(model);
            mm.modelFiles['org.doge'].definitions.should.equal(model);
        });

        it('should keep the original if an update from an object throws', () => {
            let mm = new ModelManager();
            let mf1 = sinon.createStubInstance(ModelFile);
            mf1.getNamespace.returns('org.doge');
            mf1.$marker = 'mf1';
            let res = mm.addModelFile(mf1);
            sinon.assert.calledOnce(mf1.validate);
            mm.modelFiles['org.doge'].should.equal(mf1);
            res.should.equal(mf1);

            let mf2 = sinon.createStubInstance(ModelFile);
            mf2.getNamespace.returns('org.doge');
            mf2.$marker = 'mf2';
            mf2.validate.throws(new Error('fake error'));
            (() => {
                mm.updateModelFile(mf2);
            }).should.throw(/fake error/);
            sinon.assert.calledOnce(mf2.validate);
            mm.modelFiles['org.doge'].should.equal(mf1);
        });

        it('should keep the original if an update from an string throws', () => {
            let mm = new ModelManager();
            let model = 'namespace org.doge\nasset TestAsset identified by assetId { o String assetId }';
            mm.addModelFile(model);
            mm.modelFiles['org.doge'].definitions.should.equal(model);

            let model2 = 'not a verb org.doge\nasset TestAsset2 identified by assetId2 { o String assetId2 }';
            (() => {
                mm.updateModelFile(model2);
            }).should.throw();
            mm.modelFiles['org.doge'].definitions.should.equal(model);
        });

    });

    describe('#deleteModelFile', () => {

        it('throw if the model file does not exist', () => {
            let mm = new ModelManager();
            let mf1 = sinon.createStubInstance(ModelFile);
            mf1.getNamespace.returns('org.doge');
            (() => {
                mm.deleteModelFile(mf1);
            }).should.throw(/model file does not exist/);
        });

        it('delete the model file', () => {
            let mm = new ModelManager();
            let mf1 = sinon.createStubInstance(ModelFile);
            mf1.getNamespace.returns('org.doge');
            mf1.$marker = 'mf1';
            let res = mm.addModelFile(mf1);
            sinon.assert.calledOnce(mf1.validate);
            mm.modelFiles['org.doge'].should.equal(mf1);
            res.should.equal(mf1);
            mm.deleteModelFile('org.doge');
            should.equal(mm.modelFiles['org.doge'], undefined);
        });

    });

    describe('#getNamespaces', () => {

        it('should list all of the namespaces', () => {
            let mm = new ModelManager();
            let mf1 = sinon.createStubInstance(ModelFile);
            mf1.getNamespace.returns('org.wow');
            mm.addModelFile(mf1);
            let mf2 = sinon.createStubInstance(ModelFile);
            mf2.getNamespace.returns('org.such');
            mm.addModelFile(mf2);
            mm.getNamespaces().should.include.members(['org.wow', 'org.such']);
        });

    });

});
