class Index {
    private db: IDBDatabase;
    private tableName: String;
    private databaseName: String
    private version: number = 1
    static IndexDBComponent

    constructor(databaseName: string, version: number, tableName: string, keyPath: string, autoIncrement, indexConfigs: {
        name: string;
        keyPath: string;
        unique: string;
    }[]) {
        this.databaseName = databaseName
        this.version = version

        const request: IDBOpenDBRequest = indexedDB.open(this.databaseName, version);

        request.onsuccess = (event) => {
            this.db = (event.target as IDBOpenDBRequest).result;
        };

        request.onupgradeneeded = (event) => {
            // 在升级事件中创建新表
            this.db = request.result;

            if (!this.db.objectStoreNames.contains(tableName)) {
                const objectStore = this.db.createObjectStore(tableName, {keyPath: keyPath, autoIncrement: true});
                indexConfigs.forEach((indexConfig) => {
                    objectStore.createIndex(indexConfig.name, indexConfig.keyPath, {unique: indexConfig.unique});
                });
            }
        };
        request.onerror = (event) => {

        };
    }

    /**
     * 新增/创建表
     * @param tableName {string}
     * @param version  {number}
     * @param keyPath  {string}
     * @param autoIncrement {boolean}
     * @param indexConfigs {Object}
     */
    createTable(tableName: string, version: number, keyPath: string, autoIncrement: boolean, indexConfigs: unknown[]) {
        const waitForConnection = () => {
            if (this.db) {
                this.db.close()
                const request: IDBOpenDBRequest = indexedDB.open(this.databaseName, 2);
                request.onsuccess = (event) => {
                    this.db = (event.target as IDBOpenDBRequest).result;
                    console.log(1111)

                };
                request.onupgradeneeded = (event) => {
                    // 在升级事件中创建新表
                    this.db = request.result;
                    if (!this.db.objectStoreNames.contains(tableName)) {
                        const objectStore: IDBObjectStore = this.db.createObjectStore(tableName, {
                            keyPath: keyPath,
                            autoIncrement: true
                        });
                        indexConfigs.forEach((indexConfig) => {
                            objectStore.createIndex(indexConfig.name, indexConfig.keyPath, {unique: indexConfig.unique});
                        });
                    }
                };
                request.onerror = (event) => {

                };
            } else {
                setTimeout(waitForConnection, 100);
            }
        };

        waitForConnection();
    }


    /**
     * 添加记录到对象存储空间
     * @param data{string| number} 主键
     * @returns Promise<void>
     */
    public addRecord(tableName: string, data: any): Promise<void> {
        return new Promise((resolve, reject) => {
            // 等待数据库连接成功后执行操作
            const waitForConnection = () => {
                if (this.db) {
                    const transaction: IDBTransaction = this.db.transaction([tableName], 'readwrite');
                    const objectStore: IDBObjectStore = transaction.objectStore(tableName);
                    const request: IDBRequest<IDBValidKey> = objectStore.add(data);

                    request.onsuccess = () => {
                        resolve();
                    };

                    request.onerror = (event) => {
                        reject(event.target.error);
                    };
                } else {
                    setTimeout(waitForConnection, 100);
                }
            };

            waitForConnection();
        });
    }

    /**
     * 查询指定ID的记录
     * @param key 记录ID
     * @param tableName 表名
     * @returns Promise<any> 返回查询结果
     */
    public queryRecord(tableName: string, key: any): Promise<any> {
        return new Promise((resolve, reject): void => {
            const waitForConnection = (): void => {
                if (this.db) {
                    const transaction: IDBTransaction = this.db.transaction([tableName], 'readonly');
                    const objectStore: IDBObjectStore = transaction.objectStore(tableName);
                    const request: IDBRequest<unknown> = objectStore.get(key);

                    request.onsuccess = (): void => {
                        resolve(request.result);
                    };

                    request.onerror = (event): void => {
                        reject(event.target.error);
                    };
                } else {
                    setTimeout(waitForConnection, 100);
                }
            };

            waitForConnection();

        });
    }

    /**
     * 删除记录
     * @param tableName 表名
     * @param key 主键值
     * @returns Promise<void>
     */
    public deleteRecord(tableName: string, key: any): Promise<void> {
        return new Promise((resolve, reject) => {
            const waitForConnection = () => {
                if (this.db) {
                    const transaction: IDBTransaction = this.db.transaction([tableName], 'readwrite');
                    const objectStore: IDBObjectStore = transaction.objectStore(tableName);
                    const request: IDBRequest<unknown> = objectStore.delete(key);

                    request.onsuccess = () => {
                        resolve();
                    };

                    request.onerror = (event) => {
                        reject(event.target.error);
                    };
                } else {
                    setTimeout(waitForConnection, 100);
                }
            };

            waitForConnection();
        });
    }

    /**
     * 更新数据
     * @param tableName 表名
     * @param key 主键值
     * @param newData 新数据对象
     * @returns Promise<void>
     */
    public updateRecord(tableName: string, key: any, newData: any): Promise<void> {
        return new Promise((resolve, reject): void => {
            const waitForConnection = (): void => {
                if (this.db) {
                    const transaction: IDBTransaction = this.db.transaction([tableName], 'readwrite');
                    const objectStore: IDBObjectStore = transaction.objectStore(tableName);
                    const getRequest: IDBRequest<unknown> = objectStore.get(key);
                    getRequest.onsuccess = (event): void => {
                        const existingData = event.target.result;

                        // 修改获取到的数据
                        if (existingData) {
                            Object.keys(newData).forEach((field: string): void => {
                                existingData[field] = newData[field];
                            });
                        }

                        const putRequest: IDBRequest<IDBValidKey> = objectStore.put(existingData);

                        putRequest.onsuccess = (): void => {
                            resolve();
                        };

                        putRequest.onerror = (event): void => {
                            reject(event.target.error);
                        };
                    };

                    getRequest.onerror = (event): void => {
                        reject(event.target.error);
                    };
                } else {
                    setTimeout(waitForConnection, 100);
                }
            };

            waitForConnection();
        });
    }

    /**
     * 批量更新数据
     * @param tableName 表名
     * @param updatesToUpdate {keyPathValue:string,data:unknown}需要更新的记录对象数组
     * @returns Promise<void>
     */
    public batchUpdateRecords(tableName: string, updatesToUpdate: {
        keyPathValue: string,
        data: unknown
    }[]): Promise<void> {
        return new Promise((resolve, reject) => {
            const waitForConnection = () => {
                if (this.db) {
                    const transaction: IDBTransaction = this.db.transaction([tableName], 'readwrite');
                    const objectStore: IDBObjectStore = transaction.objectStore(tableName);

                    let currentIndex: number = 0;

                    const updateNextRecord = () => {
                        if (currentIndex < updatesToUpdate.length) {
                            const update = updatesToUpdate[currentIndex];
                            const {keyPathValue, data} = update;
                            const getRequest = objectStore.get(keyPathValue);

                            getRequest.onsuccess = (event) => {
                                const existingData = event.target.result;

                                // 修改获取到的数据
                                if (existingData) {
                                    Object.keys(data).forEach((field) => {
                                        existingData[field] = data[field];
                                    });
                                }

                                const putRequest = objectStore.put(existingData);

                                putRequest.onsuccess = () => {
                                    currentIndex++;
                                    updateNextRecord();
                                };

                                putRequest.onerror = (event) => {
                                    reject(event.target.error);
                                };
                            };

                            getRequest.onerror = (event) => {
                                reject(event.target.error);
                            };
                        } else {
                            resolve();
                        }
                    };

                    updateNextRecord();
                } else {
                    setTimeout(waitForConnection, 100);
                }
            };

            waitForConnection();
        });
    }

    /**
     * 游标获取符合条件数据
     * @param tableName 表名
     * @param condition 需要更新的记录对象
     * @returns Promise<unknown[]>
     */
    public async queryDataByCursor(tableName: string, condition: unknown): Promise<unknown[]> {
        return new Promise((resolve, reject) => {
            const waitForConnection = () => {
                if (this.db) {
                    const transaction: IDBTransaction = this.db.transaction([tableName], 'readonly');
                    const objectStore: IDBObjectStore = transaction.objectStore(tableName);
                    const request: IDBRequest<IDBCursorWithValue> = objectStore.openCursor();

                    const results: any[] = [];

                    request.onsuccess = (event) => {
                        const cursor: IDBCursorWithValue = (event.target as IDBRequest<IDBCursorWithValue>).result;

                        if (cursor) {
                            // 判断是否满足条件
                            if (this.matchesCondition(cursor.value, condition)) {

                                results.push(cursor.value);
                            }
                            cursor.continue();
                        } else {
                            // 游标遍历完毕，返回结果
                            resolve(results);
                        }
                    };

                    request.onerror = (event) => {
                        reject((event.target as IDBRequest<IDBCursorWithValue>).error);
                    };
                } else {
                    setTimeout(waitForConnection, 100);
                }
            };

            waitForConnection();
        });
    }

    public async byCursor(tableName: string, condition: unknown, byCursor = (): void => {

    }): Promise<unknown[]> {
        return new Promise((resolve, reject): void => {
            const waitForConnection = (): void => {
                if (this.db) {
                    const transaction: IDBTransaction = this.db.transaction([tableName], 'readwrite');
                    const objectStore: IDBObjectStore = transaction.objectStore(tableName);
                    const request: IDBRequest<IDBCursorWithValue> = objectStore.openCursor();
                    const list: unknown[] = []
                    request.onsuccess = (event: Event): void => {
                        const cursor: IDBCursorWithValue = (event.target as IDBRequest<IDBCursorWithValue>).result;
                        if (cursor) {
                            // 判断是否满足条件
                            if (this.matchesCondition(cursor.value, condition)) {
                                byCursor(cursor)
                                list.push(cursor.value)
                            }
                            cursor.continue();
                        } else {
                            // 游标遍历完毕，返回结果
                            resolve(list);
                        }
                    };
                    request.onerror = (event: Event): void => {
                        reject((event.target as IDBRequest<IDBCursorWithValue>).error);
                    };
                } else {
                    setTimeout(waitForConnection, 100);
                }
            };

            waitForConnection();
        });
    }

    /**
     * 游标获取符合条件数据
     * @param tableName 表名
     * @param condition 需要更新的记录对象
     * @returns Promise<unknown[]>
     */
    public async queryDataByCursor(tableName: string, condition: unknown, updateData: unknown): Promise<unknown[]> {
        return new Promise(async (resolve, reject) => {
            resolve(await this.byCursor(tableName, condition))
        });
    }

    /**
     * 游标更改符合条件数据
     * @param tableName 表名
     * @param condition 需要更新的记录对象
     * @returns Promise<unknown[]>
     */
    public async updateDataByCursor(tableName: string, condition: unknown, updateData: unknown): Promise<unknown[]> {
        return new Promise((resolve, reject) => {
            this.byCursor(tableName, condition, (cursor) => {
                cursor.update({...cursor.value, ...updateData});
            })
        });
    }

    /**
     * 游标删除符合条件数据
     * @param tableName 表名
     * @param condition 需要更新的记录对象
     * @returns Promise<unknown[]>
     */
    public async deleteDataByCursor(tableName: string, condition: unknown): Promise<unknown[]> {
        return new Promise((resolve, reject) => {
            this.byCursor(tableName, condition, (cursor) => {
                cursor.delete()
            })
        });
    }

    // 辅助方法，用于判断数据是否满足条件
    private matchesCondition(data: unknown, condition: { [key: string]: unknown }): boolean {
        for (const key in condition) {
            if (data[key] !== condition[key]) {
                return false; // 遇到不匹配的条件，立即返回 false
            }
        }
        return true; // 所有条件都匹配，返回 true
    }

    /**
     * 批量删除数据
     * @param tableName 表名
     * @param keysToDelete 需要删除的主键值数组
     * @returns Promise<void>
     */
    public batchDeleteRecords(tableName: string, keysToDelete: any[]): Promise<void> {
        return new Promise((resolve, reject) => {
            const waitForConnection = () => {
                if (this.db) {

                    const transaction: IDBTransaction = this.db.transaction([tableName], 'readwrite');
                    const objectStore: IDBObjectStore = transaction.objectStore(tableName);

                    keysToDelete.forEach((key) => {
                        const request = objectStore.delete(key);

                        request.onerror = (event) => {
                            reject(event.target.error);
                        };
                    });

                    transaction.oncomplete = () => {
                        resolve();
                    };
                } else {
                    setTimeout(waitForConnection, 100);
                }
            };

            waitForConnection();
        });
    }

    /**
     * 删除表
     * @param tableName 表名
     * @returns Promise<void>
     */
    public deleteTable(tableName: string): Promise<void> {
        return new Promise((resolve, reject) => {
            const waitForConnection = () => {
                if (this.db) {
                    const transaction: IDBTransaction = this.db.transaction([tableName], 'readwrite');
                    this.db.deleteObjectStore(tableName);

                    transaction.oncomplete = () => {
                        resolve();
                    };
                } else {
                    setTimeout(waitForConnection, 100);
                }
            };

            waitForConnection();
        });
    }

    /**
     * 范围查询记录
     * @param tableName 表名
     * @param indexName 索引名
     * @param start 范围起始值
     * @param end 范围结束值
     * @returns Promise<any[]>
     */
    public queryRecordsInRange(tableName: string, indexName: string, start: any, end: any): Promise<any[]> {
        return new Promise((resolve, reject) => {
            const waitForConnection = () => {
                if (this.db) {
                    const transaction = this.db.transaction([tableName], 'readonly');
                    const objectStore = transaction.objectStore(tableName);
                    const index = objectStore.index(indexName);

                    const request = index.openCursor(IDBKeyRange.bound(start, end));

                    const results: any[] = [];

                    request.onsuccess = (event) => {
                        const cursor = event.target.result;

                        if (cursor) {
                            results.push(cursor.value);
                            cursor.continue();
                        } else {
                            resolve(results);
                        }
                    };

                    request.onerror = (event) => {
                        reject(event.target.error);
                    };
                } else {
                    setTimeout(waitForConnection, 100);
                }
            };

            waitForConnection();
        });
    }

    /**
     * 范围删除记录
     * @param tableName 表名
     * @param indexName 索引名
     * @param start 范围起始值
     * @param end 范围结束值
     * @returns Promise<void>
     */
    public deleteRecordsInRange(tableName: string, indexName: string, start: any, end: any): Promise<void> {
        return new Promise((resolve, reject) => {
            const waitForConnection = () => {
                if (this.db) {
                    const transaction = this.db.transaction([tableName], 'readwrite');
                    const objectStore = transaction.objectStore(tableName);
                    const index = objectStore.index(indexName);

                    const request = index.openCursor(IDBKeyRange.bound(start, end));

                    request.onsuccess = (event) => {
                        const cursor = event.target.result;

                        if (cursor) {
                            const deleteRequest = cursor.delete();
                            deleteRequest.onsuccess = () => {
                                cursor.continue();
                            };
                            deleteRequest.onerror = (error) => {
                                reject(error);
                            };
                        } else {
                            resolve();
                        }
                    };

                    request.onerror = (event) => {
                        reject(event.target.error);
                    };
                } else {
                    setTimeout(waitForConnection, 100);
                }
            };

            waitForConnection();
        });
    }

    /**
     * 清空表
     * @param tableName 表名
     * @returns Promise<void>
     */
    public clearTable(tableName: string): Promise<void> {
        return new Promise((resolve, reject) => {
            const waitForConnection = () => {
                if (this.db) {
                    const transaction = this.db.transaction([tableName], 'readwrite');
                    const objectStore = transaction.objectStore(tableName);
                    const request = objectStore.clear();

                    request.onsuccess = () => {
                        resolve();
                    };

                    request.onerror = (event) => {
                        reject(event.target.error);
                    };
                } else {
                    setTimeout(waitForConnection, 100);
                }
            };

            waitForConnection();
        });
    }

    /**
     * 范围修改记录
     * @param tableName 表名
     * @param indexName 索引名
     * @param start 范围起始值
     * @param end 范围结束值
     * @param newData 要更新的新数据
     * @returns Promise<void>
     */
    public updateRecordsInRange(tableName: string, indexName: string, start: any, end: any, newData: any): Promise<void> {
        return new Promise((resolve, reject) => {
            const waitForConnection = () => {
                if (this.db) {
                    const transaction = this.db.transaction([tableName], 'readwrite');
                    const objectStore = transaction.objectStore(tableName);
                    const index = objectStore.index(indexName);

                    const request = index.openCursor(IDBKeyRange.bound(start, end));

                    request.onsuccess = (event) => {
                        const cursor = event.target.result;

                        if (cursor) {
                            const updateRequest = cursor.update(newData);
                            updateRequest.onsuccess = () => {
                                cursor.continue();
                            };
                            updateRequest.onerror = (error) => {
                                reject(error);
                            };
                        } else {
                            resolve();
                        }
                    };

                    request.onerror = (event) => {
                        reject(event.target.error);
                    };
                } else {
                    setTimeout(waitForConnection, 100);
                }
            };

            waitForConnection();
        });
    }

    /**
     * 删除数据库
     * @returns Promise<void>
     */
    public deleteDatabase(): Promise<void> {
        return new Promise((resolve, reject) => {
            const request = indexedDB.deleteDatabase(this.db.name);

            request.onsuccess = () => {
                resolve();
            };

            request.onerror = (event) => {
                reject(event.target.error);
            };
        });
    }
}

export default Index
