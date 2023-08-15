# 关注 微信公众号 阿勇学前端
# 组件下载安装方式 npm i relational-indexdb 
# relational-indexdb 使用说明

##### IndexedDB：
— IndexedDB 存储量没有限制 取决于设备的硬盘

— IndexedDB 可以存储 不可序列化数据。对象 方法之类数据
- IndexedDB 是一种客户端存储技术 非关系型数据库，用于在 Web 浏览器中存储和检索大量结构化数据。

- 它提供了一个类似关系型数据库的API，但是数据存储在浏览器中而不是远程服务器上。

- IndexedDB 使用对象存储空间来存储和检索数据，类似于关系型数据库的表。

- 它支持复杂的查询和索引，以及事务操作。

- IndexedDB 在 Web 应用程序中广泛用于离线数据存储、缓存数据和本地数据持久化等场景。

- ### 虽然index DB是非关系型数据库 但是a yong为大家封装好了各种方法(updateDataByCursor、queryDataByCursor、deleteDataByCursor) 可以到达关系型数据库 那样的操作效果所以财位组件名字命名为relational-indexdb 

当谈到数据库时，有两种主要类型：关系型数据库和非关系型数据库。下面是对它们以及 IndexedDB 的简要介绍：

1. ### 关系型数据库：

   - 关系型数据库使用表格结构来组织和存储数据。
   - 数据以行和列的形式存储在表中，其中每行表示一个记录，每列表示一个属性或字段。
   - 数据之间通过关系（主键和外键）建立关联。
   - 常见的关系型数据库有 MySQL、Oracle、SQL Server 和 PostgreSQL。

2. ### 非关系型数据库（NoSQL）：

   - 非关系型数据库采用不同的数据模型，如键值对、文档、列族和图形等。
   - 它们通常更灵活，适用于处理大量非结构化和半结构化数据。
   - 没有固定的表格结构，允许动态添加或删除字段。
   - 常见的非关系型数据库有 MongoDB、Cassandra、Redis 和 Elasticsearch。



##### RelationalIndexDB构造函数

| 参数          | 类型           | 描述         |
| :------------ | -------------- | ------------ |
| databaseName  | string         | 数据库名称   |
| version       | number         | 数据库版本号 |
| createTableConfig|createTableConfig[] |数据库表配置|

createTableConfig 字段介绍
| 参数          | 类型           | 描述         |
| :------------ | -------------- | ------------ |
| tableName     | string         | 表名     |
| keyPath       | string         | 主键     |
| autoIncrement | boolean        | 是否自增 |
| indexConfigs  | IndexConfigs[] | 索引配置 |

IndexConfigs字段介绍
| 参数          | 类型           | 描述         |
| :------------ | -------------- | ------------ |
| name     | string         | 表名     |
| unique       | string         | 字段索引是否唯一     |
| keyPath       | string         |主键    |
使用示例如下
```javascript
 const tableName = 'table1';
        const titletableName = 'table2';
        const tableSchema = [
            {name: 'id', keyPath: 'id', unique: true},
            {name: 'title', keyPath: 'title', unique: false},
            {name: 'list', keyPath: 'list', unique: false},
        ];
        const tableSchemaTitle = [
            {name: 'id', keyPath: 'id', unique: true},
            {name: 'title', keyPath: 'title', unique: false},
            {name: 'issueId', keyPath: 'issueId', unique: false},
        ];
        const createTableConfig = [
            {
                tableName: tableName,
                keyPath: 'id',
                autoIncrement: true,
                keyConfig: tableSchema
            },
            {
                tableName: titletableName,
                keyPath: 'id',
                autoIncrement: true,
                keyConfig: tableSchemaTitle
            }
        ]
        this.indexDB = new RelationalIndexDB('chatGpt', 1, createTableConfig);
```



### 方法methds ⚠️ 所有方法返回值都是Promise

#### createTable(tableName, version, keyPath, autoIncrement, indexConfigs)

新增/创建表。

| 参数          | 类型           | 描述     |
| ------------- | -------------- | -------- |
| tableName     | string         | 表名     |
| version       | number         | 版本号   |
| keyPath       | string         | 主键     |
| autoIncrement | boolean        | 是否自增 |
| indexConfigs  | IndexConfigs[] | 索引配置 |

##### IndexConfigs 表配置字段结介绍

| 字段    | 类型    | 描述                                             |
| ------- | ------- | ------------------------------------------------ |
| name    | string  | 索引名称，用于标识该索引在对象存储空间中的唯一性 |
| keyPath | string  | 索引字段的路径，指定要索引的属性或键路径         |
| unique  | boolean | 指示索引的值是否唯一，默认为`false`              |

```javascript
const indexConfigs = [
  { name: 'nameIndex', keyPath: 'name', unique: false },
  { name: 'ageIndex', keyPath: 'age', unique: true },
];

```

createTable使用代码示例



```javascript
const indexDB = new RelationalIndexDB('myDatabase', 2);
indexDB.createTable('myTable', 1, 'id', true, [
  { name: 'id', keyPath: 'id', unique: true }, 
  {name: 'title', keyPath: 'title', unique: false},  
  {name: 'useName', keyPath: 'useName', unique: false},
   {name: 'level', keyPath: 'level', unique: false}
]);

```

#### addRecord(key)

添加数据

| 参数      | 类型   | 描述                                           |
| --------- | ------ | ---------------------------------------------- |
| tableName | string | 表名                                           |
| data      | Object | 存储数据:数据结构要与表结构相对应,主键不能重复 |

```javascript

indexDB.addRecord('myTable', { id: '123', useName: 'John Doe', title: '阿勇学前端', level: 100 });

```

#### queryRecord(tableName,key)

根据主键查询数据

| 参数      | 类型   | 描述   |
| --------- | ------ | ------ |
| tableName | string | 表名   |
| key       | string | 主键值 |

```
indexDB.deleteRecord('myTable', '123');
```

#### deleteRecord(tableName, key)

删除记录。

| 参数      | 类型   | 描述   |
| --------- | ------ | ------ |
| tableName | string | 表名   |
| key       | any    | 主键值 |

```javascript
//删除主键 为123 的那条数据
indexDB.updateRecord('myTable', '123');
```

#### updateRecord(tableName, key, newData)

更新数据。

| 参数      | 类型   | 描述                                                |
| --------- | ------ | --------------------------------------------------- |
| tableName | string | 表名                                                |
| key       | any    | 主键值                                              |
| newData   | any    | 新数据对象:要修改的具体字段会与老数据覆盖相同的ke y |

```javascript
/**
*这示例将会更新myTable表中 主键为 123。这条数据中 表字段 name 修改为 John Smith,更改哪个字段就写入哪个字段的新值就可以了
 类似于mysql中的s q l语句  但是要注意 index DB不能执行s q l 他是非关系型数据库
 UPDATE myTable SET name = 'John Smith' WHERE id = 123;

*/
indexDB.updateRecord('myTable', '123', { name: 'John Smith' });
```

#### batchUpdateRecords(tableName, updatesToUpdate)

| 参数            | 类型              | 描述                               |
| --------------- | ----------------- | ---------------------------------- |
| tableName       | string            | 表名                               |
| updatesToUpdate | updatesToUpdate[] | 要批量修改的列表数组字段详情见下方 |

updatesToUpdate[] 批量修改的列表数组字段详情

| 参数         | 类型   | 描述           |
| ------------ | ------ | -------------- |
| keyPathValue | string | 要修改的主键值 |
| data         | Object | 要修改的字段   |

```javascript
/**
* 批量更新跟updateRecord 一样 不同的是更新多条
*
**/
indexDB.batchUpdateRecords("myTable", [{
    keyPathValue: 1688291753347,
    data: {
        id: 1688291753347,
        name: 'ayong---6666'
    }
},
    {
        keyPathValue: 1688291767078,
        data: {
            id: 1688291767078,
            title: '阿勇学前端'
        }
    }
])
```

#### batchDeleteRecords(tableName, keysToDelete)

批量删除数据。

| 参数         | 类型   | 描述                 |
| ------------ | ------ | -------------------- |
| tableName    | string | 表名                 |
| keysToDelete | any[]  | 需要删除的主键值数组 |

```javascript
const keys = ['123', '456'];
indexDB.batchDeleteRecords('myTable', keys);
```

#### deleteTable(tableName)

删除表。

| 参数      | 类型   | 描述 |
| --------- | ------ | ---- |
| tableName | string | 表名 |

```
indexDB.deleteTable('myTable');
```

#### queryRecordsInRange(tableName, indexName, start, end)

范围查询记录。

| 类型      | 描述   |            |
| --------- | ------ | ---------- |
| tableName | string | 表名       |
| indexName | string | 索引名     |
| start     | any    | 范围起始值 |
| end       | any    | 范围结束值 |

```javascript
 //查询主键为id 值在1——20 之间的数据
indexDB.queryRecordsInRange('myTable', 'id', 1, 10).then((record) => {
      console.log('Record-----:', record);
  })
```

#### deleteRecordsInRange(tableName, indexName, start, end)

| 参数      | 类型   | 描述       |
| --------- | ------ | ---------- |
| tableName | string | 表名       |
| indexName | string | 索引名     |
| start     | any    | 范围起始值 |
| end       | any    | 范围结束值 |

```javascript
 //删除主键为id 值在1——20 之间的数据
indexDB.deleteRecordsInRange('myTable', 'id', 1, 10).then((record) => {
      console.log('Record-----:', record);
  })
```

范围修改记录。

| 参数      | 类型   | 描述           |
| --------- | ------ | -------------- |
| tableName | string | 表名           |
| indexName | string | 索引名         |
| start     | any    | 范围起始值     |
| end       | any    | 范围结束值     |
| newData   | any    | 要更新的新数据 |

## deleteDataByCursor(tableName: string, condition: object): Promise<void>

| 参数      | 类型   | 描述           |
| --------- | ------ | -------------- |
| tableName | string | 表名           |
| condition | object | 删除的条件对象 |

```javascript
/**
这个方法就是筛选符合条件数据 将这条数据删除
* 删除title = 无意义内卷   id:'123 的这条数据 就是符合多条件筛选条件 并操作这条数据
与之前的范围修改数据deleteRecordsInRange  batchDeleteRecords 不同的是他们都是以主键为筛选条件操作数据
这个方法可以提供给你可以任意以表结构中筛选任意字段 符合条件后操作数据 
它类似于mysql中 s q l 语句 DELETE FROM myTable WHERE title = '无意义内卷' AND id = '123';

*
**/
indexDB.deleteDataByCursor('myTable', { title: '无意义内卷',id:'123' })
  .then(() => {
    console.log('数据删除成功');
  })
  .catch((error) => {
    console.log('删除数据时发生错误：', error);
  });

```

## updateDataByCursor

该方法用于通过游标更新符合条件的数据。

| 参数       | 类型   | 描述           |
| ---------- | ------ | -------------- |
| tableName  | string | 表名           |
| condition  | object | 更新的条件对象 |
| updateData | object | 更新的数据对象 |

```javascript

/**
*如果更改的数据字段中有主键 例如这个表中的主键是id。那你的id 不能跟被的数据重复
它类似于s q l中的
UPDATE myTable SET title = '我要加油', id = '1231231' WHERE title = '无意义内卷' AND id = '123';

**/
indexDB.updateDataByCursor('myTable', { title: '无意义内卷',id:'123' }, { title: '我要加油',id:'1231231' })
  .then(() => {
    console.log('数据更新成功');
  })
  .catch((error) => {
    console.log('更新数据时发生错误：', error);
  });

```

## queryDataByCursor

该方法用于通过游标查询符合条件的数据。

| 参数      | 类型   | 描述           |
| --------- | ------ | -------------- |
| tableName | string | 表名           |
| condition | object | 查询的条件对象 |

```javascript
/**
根据表中多个字段查询数据 ;查询title = '无意义内卷'并且id = '123' 的数据 
它类似于s q l中的
SELECT * FROM myTable WHERE title = '无意义内卷' AND id = '123';
**/
indexDB.queryDataByCursor('myTable', { age: 30 })
  .then((results) => {
    console.log('查询到的数据：', results);
  })
  .catch((error) => {
    console.log('查询数据时发生错误：', error);
  });

```



#### clearTable(tableName)

| 参数      | 类型   | 描述 |
| --------- | ------ | ---- |
| tableName | string | 表名 |

```
indexDB.clearTable('myTable');

```

#### deleteDatabase()

删除数据库。

```
indexDB.deleteDatabase();
```
